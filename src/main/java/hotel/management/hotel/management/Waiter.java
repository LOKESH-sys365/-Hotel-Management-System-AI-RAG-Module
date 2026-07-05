package hotel.management.hotel.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class Waiter {
    @Autowired
    private RoomService roomService;

    @PostMapping
    public Room addRoom(@RequestBody Room room){
        return roomService.addRoom(room);
    }
    @GetMapping
    public List<Room> findAll(){
        return roomService.findAll();
    }
    @DeleteMapping("/{id}")
    public void DeleteRoom(@PathVariable Long id) {
        roomService.DeleteRoom(id);
    }
    @PutMapping
    public Room updateRoom(@RequestBody Room room){
        return roomService.updateRoom(room);
    }


}
