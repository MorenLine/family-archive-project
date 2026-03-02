package org.family_tree.util;

import java.util.Optional;
import org.family_tree.model.Role;
import org.family_tree.model.User;
import org.family_tree.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtil {
    private static UserRepository userRepository;

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        SecurityUtil.userRepository = userRepository;
    }

    public static Optional<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        String username = authentication.getName();
        if (username == null || username.equals("anonymousUser")) {
            return Optional.empty();
        }

        return userRepository.findByUsername(username);
    }

    public static User getCurrentUserOrThrow() {
        return getCurrentUser()
                .orElseThrow(() -> new RuntimeException("Пользователь не авторизован"));
    }

    public static boolean isAdmin() {
        return getCurrentUser()
                .map(user -> user.getRole() == Role.ADMIN)
                .orElse(false);
    }
}






