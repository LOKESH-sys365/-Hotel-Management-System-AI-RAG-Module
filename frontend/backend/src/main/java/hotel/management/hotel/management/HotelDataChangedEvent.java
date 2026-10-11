package hotel.management.hotel.management;

/**
 * Fired whenever Room, Spa, or Booking data changes, so the AI knowledge
 * base (pgvector) can be kept in sync without the RoomService/Spaservice/
 * BookingService needing to depend directly on HotelDataSyncService
 * (avoids a circular dependency, since HotelDataSyncService already
 * depends on those services to read data).
 */
public class HotelDataChangedEvent {

    public enum EntityType {
        ROOM,
        SPA,
        BOOKING
    }

    private final EntityType entityType;

    public HotelDataChangedEvent(EntityType entityType) {
        this.entityType = entityType;
    }

    public EntityType getEntityType() {
        return entityType;
    }
}