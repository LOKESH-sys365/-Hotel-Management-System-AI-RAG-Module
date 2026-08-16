package hotel.management.hotel.management;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class RoomService {
    @Autowired
    private RoomRespository roomRespository;

   public Room addRoom(Room room){
       roomRespository.save(room);

       return room;
   }
    public List<Room> findAll(){
        return roomRespository.findAll();
    }
    public void DeleteRoom(Long Id){
        roomRespository.deleteById(Id);
    }
    public Room updateRoom(Room room){
        return roomRespository.save(room);
    }

}
