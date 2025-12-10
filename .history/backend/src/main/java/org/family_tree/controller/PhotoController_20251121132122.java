package org.family_tree.controller;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.family_tree.model.Photo;
import org.family_tree.repository.PersonRepository;
import org.family_tree.repository.PhotoRepository;
import org.family_tree.model.dto.PhotoDto;
import org.family_tree.service.PhotoService;
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

@RestController
@RequestMapping("api/photos")
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
        return photoRepository.findByPersonIdOrderBySortOrderAsc(personId);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam("personId") Long personId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "photoDate", required = false) LocalDate photoDate) {
        try {
            Photo savedPhoto = photoService.savePhoto(file, personId, description, photoDate);
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
        Optional<Photo> photoOpt = photoRepository.findById(photoId);
        if (photoOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Фото не найдено");
        }

        Photo photo = photoOpt.get();
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
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG) // или определить тип по расширению
                    .body(photoData);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
