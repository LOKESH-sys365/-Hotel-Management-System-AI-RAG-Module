package hotel.management.hotel.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/room")
public class RoomController {
    @Autowired
    private RoomService roomService;

    @Autowired
    private HotelDataSyncService hotelDataSyncService;

    @PostMapping
    public Room addRoom(@RequestBody Room room){
        Room saved = roomService.addRoom(room);
        hotelDataSyncService.syncRooms();
        return saved;
    }

    @GetMapping
    public List<Room> findAll(){
        return roomService.findAll();
    }

    @PutMapping
    public Room updateRoom(@RequestBody Room room){
        Room updated = roomService.updateRoom(room);
        hotelDataSyncService.syncRooms();
        return updated;
    }

    @DeleteMapping("/{id}")
    public void deleteRoom(@PathVariable Long id){
        roomService.DeleteRoom(id);
        hotelDataSyncService.syncRooms();
    }
}
