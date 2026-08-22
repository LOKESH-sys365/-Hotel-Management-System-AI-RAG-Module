package hotel.management.hotel.management;

import org.hibernate.sql.Insert;
import org.hibernate.sql.ast.tree.insert.Values;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCallback;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.stereotype.Component;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;



@Component
public class VectorRespository {

    @Qualifier("postgresJdbcTemplate")
    @Autowired

    private JdbcTemplate jdbcTemplate;

    public void saveEmbedding(Long userId, String content, float[] embedding, String metadata) {
        String sql = "INSERT INTO ai_documents(user_id,content,embedding,metadata) VALUES(?,?,?::vector,?::jsonb)";
        Float[] floatObjects = new Float[embedding.length];
        for (int i = 0; i < embedding.length; i++) {
            floatObjects[i] = embedding[i];

        }
        jdbcTemplate.execute(sql, (PreparedStatementCallback<Void>) ps -> {
            ps.setLong(1, userId);
            ps.setString(2, content);
            ps.setArray(3, ps.getConnection().createArrayOf("float4", floatObjects));
            ps.setString(4, metadata);
            ps.executeUpdate();
            return null;


        });
    }

    public List<String> searchSimilar(float[] queryEmbedding, Long userId, int limit) {
        String sql = "SELECT content FROM ai_documents WHERE user_id=? ORDER BY embedding <=> ?::vector LIMIT ?";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < queryEmbedding.length; i++) {
            sb.append(queryEmbedding[i]);
            if (i < queryEmbedding.length - 1) sb.append(",");
        }
        sb.append("]");
        return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("content"),
                userId, sb.toString(), limit);
    }
}