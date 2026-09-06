package hotel.management.hotel.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/spa")
public class SpaController {
    @Autowired
    private HotelDataSyncService hotelDataSyncService;
    @Autowired

    private Spaservice spaService;

    @PostMapping
    public Spa addService(@RequestBody Spa spa){
        Spa saved = spaService.addService(spa);
        hotelDataSyncService.syncSpa();
        return saved;
    }
    @GetMapping
    public List<Spa> findAll(){
        return spaService.findAll();
    }
    @PutMapping
    public Spa updateService(@RequestBody Spa spa){
        Spa updated = spaService.updateService(spa);
        hotelDataSyncService.syncSpa();
        return updated;
    }
    @DeleteMapping("/{id}")
    public void deleteService(@PathVariable Long id){
        spaService.deleteService(id);
        hotelDataSyncService.syncSpa();
    }


}
