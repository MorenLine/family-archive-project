package org.family_tree.controller;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.family_tree.model.Photo;
import org.family_tree.model.Person;
import org.family_tree.model.User;
import org.family_tree.repository.PersonRepository;
import org.family_tree.repository.PhotoRepository;
import org.family_tree.model.dto.PhotoDto;
import org.family_tree.service.PhotoService;
import org.family_tree.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("api/photos")
@CrossOrigin(origins = "*")
public class PhotoController {

    @Autowired
    private PhotoRepository photoRepository;

    @Autowired
    private PersonRepository personRepository;

    @Autowired
    private PhotoService photoService;

    private final String UPLOAD_DIR = "uploads/photos/";

    @GetMapping("/person/{personId}")
    public List<Photo> getPersonPhotos(@PathVariable Long personId) {
        User currentUser = SecurityUtil.getCurrentUserOrThrow();
        Optional<Person> personOpt = SecurityUtil.isAdmin()
                ? personRepository.findById(personId)
                : personRepository.findByIdAndUser(personId, currentUser);
        if (personOpt.isEmpty()) {
            return List.of();
        }
        return photoRepository.findByPersonIdOrderBySortOrderAsc(personId);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam("personId") Long personId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "photoDate", required = false) LocalDate photoDate,
            @RequestParam(value = "originalFileName", required = false) String originalFileName) {
        try {
            User currentUser = SecurityUtil.getCurrentUserOrThrow();
            Optional<Person> personOpt = SecurityUtil.isAdmin()
                    ? personRepository.findById(personId)
                    : personRepository.findByIdAndUser(personId, currentUser);
            if (personOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Персона не найдена или не принадлежит текущему пользователю");
            }
            Photo savedPhoto = photoService.savePhoto(file, personOpt.get(), description, photoDate, originalFileName);
            return ResponseEntity.ok(savedPhoto);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Ошибка при загрузке фото: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{photoId}")
    public ResponseEntity<?> deletePhoto(@PathVariable Long photoId) throws IOException {
        try {
            User currentUser = SecurityUtil.getCurrentUserOrThrow();
            Optional<Photo> photoOpt = photoRepository.findById(photoId);
            if (photoOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Фото не найдено");
            }
            Photo photo = photoOpt.get();
            if (!SecurityUtil.isAdmin() && !photo.getPerson().getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.badRequest().body("Фото не принадлежит текущему пользователю");
            }
            photoService.deletePhoto(photoId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{photoId}")
    public ResponseEntity<?> updatePhotoMetadata(
            @PathVariable Long photoId,
            @RequestBody PhotoDto photoDto) {
        User currentUser = SecurityUtil.getCurrentUserOrThrow();
        Optional<Photo> photoOpt = photoRepository.findById(photoId);
        if (photoOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Фото не найдено");
        }

        Photo photo = photoOpt.get();
        if (!SecurityUtil.isAdmin() && !photo.getPerson().getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.badRequest().body("Фото не принадлежит текущему пользователю");
        }
        // Обновляем доступные метаданные (включая название файла/оригинальное имя)
        if (photoDto.getOriginalFileName() != null) {
            photo.setOriginalFileName(photoDto.getOriginalFileName());
        }
        photo.setDescription(photoDto.getDescription());
        photo.setPhotoDate(photoDto.getPhotoDate());
        photo.setSortOrder(photoDto.getSortOrder());

        Photo updatedPhoto = photoRepository.save(photo);
        return ResponseEntity.ok(updatedPhoto);
    }

    @GetMapping("/file/{fileName}")
    public ResponseEntity<byte[]> getPhotoFile(@PathVariable String fileName) {
        try {
            byte[] photoData = photoService.getPhotoFile(fileName);
            
            // Определяем Content-Type по расширению файла
            MediaType mediaType = MediaType.IMAGE_JPEG;
            String lowerFileName = fileName.toLowerCase();
            if (lowerFileName.endsWith(".png")) {
                mediaType = MediaType.IMAGE_PNG;
            } else if (lowerFileName.endsWith(".webp")) {
                mediaType = MediaType.parseMediaType("image/webp");
            } else if (lowerFileName.endsWith(".gif")) {
                mediaType = MediaType.IMAGE_GIF;
            }
            
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(photoData);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{photoId}/set-main")
    public ResponseEntity<?> setMainPhoto(@PathVariable Long photoId) {
        User currentUser = SecurityUtil.getCurrentUserOrThrow();
        Optional<Photo> photoOpt = photoRepository.findById(photoId);
        if (photoOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Фото не найдено");
        }
        Photo photo = photoOpt.get();
        if (!SecurityUtil.isAdmin() && !photo.getPerson().getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.badRequest().body("Фото не принадлежит текущему пользователю");
        }
        try {
            Photo mainPhoto = photoService.setMainPhoto(photoId);
            return ResponseEntity.ok(mainPhoto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/person/{personId}/remove-main")
    public ResponseEntity<?> removeMainPhoto(@PathVariable Long personId) {
        User currentUser = SecurityUtil.getCurrentUserOrThrow();
        Optional<Person> personOpt = SecurityUtil.isAdmin()
                ? personRepository.findById(personId)
                : personRepository.findByIdAndUser(personId, currentUser);
        if (personOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Персона не найдена или не принадлежит текущему пользователю");
        }
        try {
            photoService.removeMainPhoto(personId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/person/{personId}/main")
    public ResponseEntity<?> getMainPhoto(@PathVariable Long personId) {
        User currentUser = SecurityUtil.getCurrentUserOrThrow();
        Optional<Person> personOpt = SecurityUtil.isAdmin()
                ? personRepository.findById(personId)
                : personRepository.findByIdAndUser(personId, currentUser);
        if (personOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Optional<Photo> mainPhotoOpt = photoService.getMainPhoto(personId);
        return mainPhotoOpt
                .map(photo -> ResponseEntity.ok(photo))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
