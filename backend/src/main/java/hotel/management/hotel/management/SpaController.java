package hotel.management.hotel.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/spa")
public class SpaController {
    @Autowired
    private Spaservice spaService;

    @PostMapping
    public Spa addService(@RequestBody Spa spa){
        return spaService.addService(spa);
    }
    @GetMapping
    public List<Spa> findAll(){
        return spaService.findAll();
    }
    @PutMapping
    public Spa updateService(@RequestBody Spa spa){
        return spaService.updateService(spa);
    }
    @DeleteMapping("/{id}")
    public void deleteService(@PathVariable Long id){
        spaService.deleteService(id);
    }


}
