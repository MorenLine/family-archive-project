package org.family_tree.controller;

import java.util.List;
import java.util.stream.Collectors;
import org.family_tree.model.User;
import org.family_tree.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserService userService;

    @GetMapping("/users")
    public List<UserSummary> getUsers() {
        return userService.findAll().stream()
                .map(UserSummary::from)
                .collect(Collectors.toList());
    }

    public record UserSummary(Long id, String username, String email, String role) {
        public static UserSummary from(User user) {
            return new UserSummary(user.getId(), user.getUsername(), user.getEmail(),
                    user.getRole() != null ? user.getRole().name() : "USER");
        }
    }
}

