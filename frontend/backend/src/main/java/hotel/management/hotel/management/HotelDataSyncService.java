package hotel.management.hotel.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class HotelDataSyncService {

    private static final Long SYSTEM_USER_ID = 1L;
    private static final String ROOM_SOURCE = "room_sync";
    private static final String SPA_SOURCE = "spa_sync";
    private static final String BOOKING_SOURCE = "booking_sync";

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    @Autowired
    private RoomService roomService;

    @Autowired
    private Spaservice spaService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private TextChunker textChunker;

    @Autowired
    private OllamaEmbeddingModel embeddingModel;

    @Autowired
    private VectorService vectorService;

    public String syncAll() {
        int roomCount = syncRooms();
        int spaCount = syncSpa();
        int bookingCount = syncBookings();
        return "Synced " + roomCount + " room record(s), " + spaCount
                + " spa record(s), and " + bookingCount + " booking record(s) into the knowledge base.";
    }

    public int syncRooms() {
        vectorService.deleteBySource(SYSTEM_USER_ID, ROOM_SOURCE);
        List<Room> rooms = roomService.findAll();
        for (Room room : rooms) {
            ingest(buildRoomFact(room), ROOM_SOURCE);
        }
        return rooms.size();
    }

    public int syncSpa() {
        vectorService.deleteBySource(SYSTEM_USER_ID, SPA_SOURCE);
        List<Spa> services = spaService.findAll();
        for (Spa spa : services) {
            ingest(buildSpaFact(spa), SPA_SOURCE);
        }
        return services.size();
    }

    public int syncBookings() {
        vectorService.deleteBySource(SYSTEM_USER_ID, BOOKING_SOURCE);
        List<Booking> bookings = bookingService.findAll();
        for (Booking booking : bookings) {
            String fact = buildBookingFact(booking);
            if (fact != null) {
                ingest(fact, BOOKING_SOURCE);
            }
        }
        return bookings.size();
    }

    /**
     * Fired automatically by RoomService / Spaservice / BookingService right
     * after a create, update, or delete, so the assistant's knowledge stays
     * fresh without anyone having to click "Sync Hotel Data" manually.
     * Runs @Async so the original API call (e.g. adding a room) returns
     * immediately instead of waiting on the embedding calls.
     */
    @Async
    @EventListener
    public void onHotelDataChanged(HotelDataChangedEvent event) {
        switch (event.getEntityType()) {
            case ROOM -> syncRooms();
            case SPA -> syncSpa();
            case BOOKING -> syncBookings();
        }
    }

    /**
     * Safety-net full re-sync, in case an event was ever missed (e.g. a
     * server restart, a direct DB edit, or a bulk import). Runs every
     * 4 hours; first run is delayed 2 minutes after startup so the app
     * has time to finish booting and connect to both databases.
     */
    @Scheduled(initialDelay = 2 * 60 * 1000, fixedRate = 4 * 60 * 60 * 1000)
    public void scheduledResync() {
        syncAll();
    }

    private void ingest(String factText, String source) {
        List<String> chunks = textChunker.chunk(factText);
        String metadata = "{\"source\":\"" + source + "\"}";
        for (String chunk : chunks) {
            float[] embedding = embeddingModel.getEmbedding(chunk);
            vectorService.saveEmbedding(SYSTEM_USER_ID, chunk, embedding, metadata);
        }
    }

    private String buildRoomFact(Room room) {
        return String.format(
                "Room %s is a %s room priced at %.2f per night. It is currently %s.",
                room.getRoomNumber(),
                room.getRoomType(),
                room.getPrice(),
                room.isAvailable() ? "available for booking" : "not available"
        );
    }

    private String buildSpaFact(Spa spa) {
        return String.format(
                "%s is a spa service that takes %d minutes and costs %.2f. It is currently %s.",
                spa.getServiceName(),
                spa.getDuration(),
                spa.getPrice(),
                spa.isAvailable() ? "available" : "not available"
        );
    }

    private String buildBookingFact(Booking booking) {
        if (booking.getRoom() == null) return null;

        String roomNumber = booking.getRoom().getRoomNumber();
        String customerName = booking.getCustomer() != null ? booking.getCustomer().getName() : "a guest";
        String checkin = booking.getCheckinDate() != null ? booking.getCheckinDate().format(DATE_FMT) : "an unspecified date";
        String checkout = booking.getCheckoutDate() != null ? booking.getCheckoutDate().format(DATE_FMT) : "an unspecified date";

        return String.format(
                "Room %s is booked by %s from %s to %s. This means Room %s is NOT available for that date range.",
                roomNumber, customerName, checkin, checkout, roomNumber
        );
    }
}