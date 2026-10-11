package hotel.management.hotel.management;

import com.fasterxml.jackson.annotation.JacksonAnnotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRespository extends JpaRepository<Room,Long> {
}
