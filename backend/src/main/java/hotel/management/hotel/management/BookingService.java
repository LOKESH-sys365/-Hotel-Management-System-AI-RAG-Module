package hotel.management.hotel.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {
    @Autowired
    private BookingRespository bookingRespository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    public Booking createBooking(Booking booking) {
        Booking saved = bookingRespository.save(booking);
        eventPublisher.publishEvent(new HotelDataChangedEvent(HotelDataChangedEvent.EntityType.BOOKING));
        return saved;
    }
    public List<Booking> findAll() {
        return bookingRespository.findAll();
    }
    public void deleteBooking(Long id) {
        bookingRespository.deleteById(id);
        eventPublisher.publishEvent(new HotelDataChangedEvent(HotelDataChangedEvent.EntityType.BOOKING));
    }

}