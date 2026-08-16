package hotel.management.hotel.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {
    @Autowired
   private BookingRespository bookingRespository;

    public Booking createBooking(Booking booking) {
        return bookingRespository.save(booking);
    }
    public List<Booking> findAll() {
        return bookingRespository.findAll();
    }
    public void deleteBooking(Long id) {
        bookingRespository.deleteById(id);
    }

}
