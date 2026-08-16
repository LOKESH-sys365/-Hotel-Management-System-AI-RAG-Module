package hotel.management.hotel.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/booking")
public class BookingController {
    @Autowired
    private BookingService bookingService;

    @PostMapping
    public Booking createBooking(@RequestBody Booking booking){
        return bookingService.createBooking(booking);
    }
    @GetMapping
    public List<Booking> findAllBooking(){
        return bookingService.findAll();
    }
    @DeleteMapping("/{id}")
    public void deleteBooking(@PathVariable Long id){
        bookingService.deleteBooking(id);
    }

}
