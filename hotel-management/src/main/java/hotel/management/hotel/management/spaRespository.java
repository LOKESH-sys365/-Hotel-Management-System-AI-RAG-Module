package hotel.management.hotel.management;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface spaRespository extends JpaRepository<Spa,Long> {
}
