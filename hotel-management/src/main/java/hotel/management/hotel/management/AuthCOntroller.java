package hotel.management.hotel.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthCOntroller {
    @Autowired
    private JwtUtil jwtUtil;
    @PostMapping("/login")
    public String login(@RequestBody Loginrequest loginRequest){
        if(loginRequest.getUsername().equals("admin")&& loginRequest.getPassword().equals("admin123")){
            return  jwtUtil.generateToken(loginRequest.getUsername());

        }
        return  "Invalid username or password";
    }
}
