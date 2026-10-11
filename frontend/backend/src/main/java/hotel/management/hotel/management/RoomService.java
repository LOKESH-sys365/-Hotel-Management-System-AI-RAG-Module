package hotel.management.hotel.management;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class RoomService {
    @Autowired
    private RoomRespository roomRespository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    public Room addRoom(Room room){
        roomRespository.save(room);
        eventPublisher.publishEvent(new HotelDataChangedEvent(HotelDataChangedEvent.EntityType.ROOM));
        return room;
    }
    public List<Room> findAll(){
        return roomRespository.findAll();
    }
    public void DeleteRoom(Long Id){
        roomRespository.deleteById(Id);
        eventPublisher.publishEvent(new HotelDataChangedEvent(HotelDataChangedEvent.EntityType.ROOM));
    }
    public Room updateRoom(Room room){
        Room saved = roomRespository.save(room);
        eventPublisher.publishEvent(new HotelDataChangedEvent(HotelDataChangedEvent.EntityType.ROOM));
        return saved;
    }

}
