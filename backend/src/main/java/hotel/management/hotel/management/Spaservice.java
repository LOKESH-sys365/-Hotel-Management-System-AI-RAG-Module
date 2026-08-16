package hotel.management.hotel.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class Spaservice {
    @Autowired
    private spaRespository spaRespository;

    public Spa addService(Spa spa){
        return spaRespository.save(spa);
    }
    public List<Spa> findAll(){
        return spaRespository.findAll();
    }
    public Spa updateService(Spa spa){
        return spaRespository.save(spa);
    }
    public void deleteService(Long id){
        spaRespository.deleteById(id);
    }

}
