package org.family_tree.controller;

import java.util.HashMap;
import java.util.Map;
import org.family_tree.model.User;
import org.family_tree.security.JwtTokenProvider;
import org.family_tree.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserService userService;

    @Autowired
    private UserDetailsService userDetailsService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            String username = loginRequest.get("username");
            String password = loginRequest.get("password");

            // Аутентификация пользователя
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            // Генерация JWT токена
            String token = tokenProvider.generateToken(username);

            // Получаем информацию о пользователе
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            User dbUser = userService.findByUsername(username).orElseThrow();

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("username", username);
            response.put("type", "Bearer");
            response.put("role", dbUser.getRole().name());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Неверное имя пользователя или пароль");
            return ResponseEntity.status(401).body(error);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> registerRequest) {
        try {
            String username = registerRequest.get("username");
            String password = registerRequest.get("password");
            String email = registerRequest.get("email");

            // Проверяем, существует ли пользователь
            if (userService.findByUsername(username).isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Пользователь с таким именем уже существует");
                return ResponseEntity.status(400).body(error);
            }

            // Создаем нового пользователя
            User user = new User();
            user.setUsername(username);
            user.setPassword(password);
            user.setEmail(email != null && !email.isEmpty() ? email : username + "@example.com");
            user = userService.save(user);

            // Генерируем токен для автоматического входа
            String token = tokenProvider.generateToken(username);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("username", username);
            response.put("type", "Bearer");
            response.put("role", user.getRole().name());
            response.put("message", "Пользователь успешно зарегистрирован");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Ошибка при регистрации: " + e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> me() {
        Map<String, Object> response = new HashMap<>();
        Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String username = authentication.getName();
        User user = userService.findByUsername(username).orElseThrow();
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name());
        return ResponseEntity.ok(response);
    }
}
