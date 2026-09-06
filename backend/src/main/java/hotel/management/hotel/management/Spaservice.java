package hotel.management.hotel.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class Spaservice {
    @Autowired
    private spaRespository spaRespository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    public Spa addService(Spa spa){
        Spa saved = spaRespository.save(spa);
        eventPublisher.publishEvent(new HotelDataChangedEvent(HotelDataChangedEvent.EntityType.SPA));
        return saved;
    }
    public List<Spa> findAll(){
        return spaRespository.findAll();
    }
    public Spa updateService(Spa spa){
        Spa saved = spaRespository.save(spa);
        eventPublisher.publishEvent(new HotelDataChangedEvent(HotelDataChangedEvent.EntityType.SPA));
        return saved;
    }
    public void deleteService(Long id){
        spaRespository.deleteById(id);
        eventPublisher.publishEvent(new HotelDataChangedEvent(HotelDataChangedEvent.EntityType.SPA));
    }

}
