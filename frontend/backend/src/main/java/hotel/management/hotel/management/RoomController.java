package hotel.management.hotel.management;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/room")
public class RoomController {

    private static final Logger logger = LoggerFactory.getLogger(RoomController.class);

    @Autowired
    private RoomService roomService;

    @Autowired
    private HotelDataSyncService hotelDataSyncService;

    @PostMapping
    public Room addRoom(@RequestBody Room room){
        Room saved = roomService.addRoom(room);
        syncRoomsSafely();
        return saved;
    }

    @GetMapping
    public List<Room> findAll(){
        return roomService.findAll();
    }

    @PutMapping
    public Room updateRoom(@RequestBody Room room){
        Room updated = roomService.updateRoom(room);
        syncRoomsSafely();
        return updated;
    }

    @DeleteMapping("/{id}")
    public void deleteRoom(@PathVariable Long id){
        roomService.DeleteRoom(id);
        syncRoomsSafely();
    }

    private void syncRoomsSafely() {
        try {
            hotelDataSyncService.syncRooms();
        } catch (Exception e) {
            logger.error("Room knowledge-base sync failed after a room CRUD operation: {}", e.getMessage(), e);
        }
    }
}
