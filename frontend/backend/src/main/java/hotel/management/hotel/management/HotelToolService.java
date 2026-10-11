package hotel.management.hotel.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * "Tools" the chat assistant can call to get LIVE data straight from the
 * database — as opposed to the RAG pipeline, which only knows whatever was
 * manually ingested or last synced into the vector store. This is what lets
 * the assistant correctly answer time-sensitive questions like
 * "how many rooms are free tonight?" even if nobody has re-synced recently.
 */
@Service
public class HotelToolService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    @Autowired
    private RoomService roomService;

    @Autowired
    private BookingService bookingService;

    /**
     * A room is booked "tonight" if today's date falls within
     * [checkinDate, checkoutDate) for some booking on that room.
     */
    private Set<String> roomNumbersBookedTonight() {
        LocalDate today = LocalDate.now();
        return bookingService.findAll().stream()
                .filter(b -> b.getRoom() != null
                        && b.getCheckinDate() != null
                        && b.getCheckoutDate() != null
                        && !today.isBefore(b.getCheckinDate())
                        && today.isBefore(b.getCheckoutDate()))
                .map(b -> b.getRoom().getRoomNumber())
                .collect(Collectors.toSet());
    }

    /** Rooms that are marked available AND have no active booking tonight. */
    public List<Room> getRoomsAvailableTonight() {
        Set<String> booked = roomNumbersBookedTonight();
        return roomService.findAll().stream()
                .filter(r -> r.isAvailable() && !booked.contains(r.getRoomNumber()))
                .collect(Collectors.toList());
    }

    /**
     * Builds a natural-language summary of tonight's room availability,
     * ready to be dropped straight into the LLM prompt as live context.
     */
    public String describeAvailabilityTonight() {
        List<Room> freeRooms = getRoomsAvailableTonight();
        int totalRooms = roomService.findAll().size();

        if (freeRooms.isEmpty()) {
            return "As of right now, there are 0 rooms free tonight out of " + totalRooms + " total rooms. The hotel is fully booked tonight.";
        }

        String roomList = freeRooms.stream()
                .map(r -> String.format("Room %s (%s, %.2f/night)", r.getRoomNumber(), r.getRoomType(), r.getPrice()))
                .collect(Collectors.joining(", "));

        return String.format(
                "As of right now, there are %d room(s) free tonight out of %d total rooms. Free rooms: %s.",
                freeRooms.size(), totalRooms, roomList
        );
    }

    /**
     * Live status for one specific room — is it free right now, and if not,
     * who has it booked and until when.
     */
    public String describeRoomStatus(String roomNumber) {
        Room room = roomService.findAll().stream()
                .filter(r -> r.getRoomNumber() != null && r.getRoomNumber().equalsIgnoreCase(roomNumber))
                .findFirst()
                .orElse(null);

        if (room == null) {
            return "There is no room numbered '" + roomNumber + "' in the system.";
        }

        if (!room.isAvailable()) {
            return "Room " + room.getRoomNumber() + " is currently marked as not available (e.g. under maintenance).";
        }

        LocalDate today = LocalDate.now();
        return bookingService.findAll().stream()
                .filter(b -> b.getRoom() != null
                        && room.getRoomNumber().equalsIgnoreCase(b.getRoom().getRoomNumber())
                        && b.getCheckinDate() != null
                        && b.getCheckoutDate() != null
                        && !today.isBefore(b.getCheckinDate())
                        && today.isBefore(b.getCheckoutDate()))
                .findFirst()
                .map(b -> String.format(
                        "Room %s is currently booked by %s from %s to %s, so it is NOT available right now.",
                        room.getRoomNumber(),
                        b.getCustomer() != null ? b.getCustomer().getName() : "a guest",
                        b.getCheckinDate().format(DATE_FMT),
                        b.getCheckoutDate().format(DATE_FMT)
                ))
                .orElse(String.format(
                        "Room %s (%s, %.2f/night) is available right now.",
                        room.getRoomNumber(), room.getRoomType(), room.getPrice()
                ));
    }
}