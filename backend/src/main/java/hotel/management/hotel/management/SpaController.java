package hotel.management.hotel.management;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/spa")
public class SpaController {

    private static final Logger logger = LoggerFactory.getLogger(SpaController.class);

    @Autowired
    private Spaservice spaService;

    @Autowired
    private HotelDataSyncService hotelDataSyncService;

    @PostMapping
    public Spa addService(@RequestBody Spa spa){
        Spa saved = spaService.addService(spa);
        syncSpaSafely();
        return saved;
    }
    @GetMapping
    public List<Spa> findAll(){
        return spaService.findAll();
    }
    @PutMapping
    public Spa updateService(@RequestBody Spa spa){
        Spa updated = spaService.updateService(spa);
        syncSpaSafely();
        return updated;
    }
    @DeleteMapping("/{id}")
    public void deleteService(@PathVariable Long id){
        spaService.deleteService(id);
        syncSpaSafely();
    }

    private void syncSpaSafely() {
        try {
            hotelDataSyncService.syncSpa();
        } catch (Exception e) {
            logger.error("Spa knowledge-base sync failed after a spa CRUD operation: {}", e.getMessage(), e);
        }
    }
}



