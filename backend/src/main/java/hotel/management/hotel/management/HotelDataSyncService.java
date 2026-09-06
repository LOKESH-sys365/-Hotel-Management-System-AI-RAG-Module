package hotel.management.hotel.management;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HotelDataSyncService {

    private static final Logger logger = LoggerFactory.getLogger(HotelDataSyncService.class);

    private static final Long SYSTEM_USER_ID = 1L;
    private static final String ROOM_SOURCE = "room_sync";
    private static final String SPA_SOURCE = "spa_sync";

    @Autowired
    private RoomService roomService;

    @Autowired
    private Spaservice spaService;

    @Autowired
    private TextChunker textChunker;

    @Autowired
    private OllamaEmbeddingModel embeddingModel;

    @Autowired
    private VectorService vectorService;

    public String syncAll() {
        int roomCount = syncRooms();
        int spaCount = syncSpa();
        return "Synced " + roomCount + " room record(s) and " + spaCount + " spa record(s) into the knowledge base.";
    }

    public int syncRooms() {
        logger.info("Starting room sync...");
        vectorService.deleteBySource(SYSTEM_USER_ID, ROOM_SOURCE);
        List<Room> rooms = roomService.findAll();
        int successCount = 0;
        for (Room room : rooms) {
            try {
                ingest(buildRoomFact(room), ROOM_SOURCE);
                successCount++;
            } catch (Exception e) {
                logger.error("Failed to sync room id={} roomNumber={}: {}",
                        room.getId(), room.getRoomNumber(), e.getMessage(), e);
            }
        }
        logger.info("Room sync finished: {}/{} room(s) embedded successfully.", successCount, rooms.size());
        return successCount;
    }

    public int syncSpa() {
        logger.info("Starting spa sync...");
        vectorService.deleteBySource(SYSTEM_USER_ID, SPA_SOURCE);
        List<Spa> services = spaService.findAll();
        int successCount = 0;
        for (Spa spa : services) {
            try {
                ingest(buildSpaFact(spa), SPA_SOURCE);
                successCount++;
            } catch (Exception e) {
                logger.error("Failed to sync spa id={} serviceName={}: {}",
                        spa.getId(), spa.getServiceName(), e.getMessage(), e);
            }
        }
        logger.info("Spa sync finished: {}/{} spa service(s) embedded successfully.", successCount, services.size());
        return successCount;
    }

    private void ingest(String factText, String source) {
        List<String> chunks = textChunker.chunk(factText);
        String metadata = "{\"source\":\"" + source + "\"}";
        for (String chunk : chunks) {
            float[] embedding = embeddingModel.getEmbedding(chunk);
            vectorService.saveEmbedding(SYSTEM_USER_ID, chunk, embedding, metadata);
        }
    }

    private String buildRoomFact(Room room) {
        return String.format(
                "Room %s is a %s room priced at %.2f per night. It is currently %s.",
                room.getRoomNumber(),
                room.getRoomType(),
                room.getPrice(),
                room.isAvailable() ? "available for booking" : "not available"
        );
    }

    private String buildSpaFact(Spa spa) {
        return String.format(
                "%s is a spa service that takes %d minutes and costs %.2f. It is currently %s.",
                spa.getServiceName(),
                spa.getDuration(),
                spa.getPrice(),
                spa.isAvailable() ? "available" : "not available"
        );
    }
}
