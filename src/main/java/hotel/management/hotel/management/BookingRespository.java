package hotel.management.hotel.management;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRespository extends JpaRepository<Booking, Long> {
}
