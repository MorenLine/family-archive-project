package org.family_tree.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.family_tree.model.Person;
import org.family_tree.model.Photo;
import org.family_tree.repository.PersonRepository;
import org.family_tree.repository.PhotoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PhotoService {

    @Autowired
    private PhotoRepository photoRepository;

    @Autowired
    private PersonRepository personRepository;

    private final String UPLOAD_DIR = "uploads/photos/";

    public Photo savePhoto(MultipartFile file, Person person, String description, LocalDate photoDate,
            String customOriginalFileName)
            throws IOException {
        if (person == null) {
            throw new RuntimeException("Персона не найдена");
        }

        Path uploadPath = Path.of(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Используем переданное название, если оно есть, иначе используем оригинальное имя файла
        String originalFileName = (customOriginalFileName != null && !customOriginalFileName.trim().isEmpty()) 
            ? customOriginalFileName.trim() 
            : file.getOriginalFilename();
        
        String fileExtension = "";
        if (file.getOriginalFilename() != null && file.getOriginalFilename().contains(".")) {
            fileExtension = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + fileExtension;

        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        Photo photo = new Photo();
        photo.setFileName(fileName);
        photo.setOriginalFileName(originalFileName);
        photo.setDescription(description);
        photo.setPhotoDate(photoDate);
        photo.setPerson(person);

        if (photoDate != null) {
            photo.setSortOrder(
                    photoDate.getYear() * 10000 + photoDate.getMonthValue() * 100 + photoDate.getDayOfMonth());
        } else {
            photo.setSortOrder(99999999);
        }
        return photoRepository.save(photo);
    }

    public void deletePhoto(Long photoId) throws IOException {
        Optional<Photo> photoOpt = photoRepository.findById(photoId);
        if (photoOpt.isEmpty()) {
            throw new RuntimeException("Фото не найдено");
        }

        Photo photo = photoOpt.get();

        try {
            Path filePath = Path.of(UPLOAD_DIR + photo.getFileName());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new IOException("Ошибка при удалении файла фото", e);
        }

        photoRepository.delete(photo);
    }

    public byte[] getPhotoFile(String fileName) throws IOException {
        Path filePath = Paths.get(UPLOAD_DIR + fileName);
        return Files.readAllBytes(filePath);
    }

    public Photo setMainPhoto(Long photoId) {
        Optional<Photo> photoOpt = photoRepository.findById(photoId);
        if (photoOpt.isEmpty()) {
            throw new RuntimeException("Фото не найдено");
        }

        Photo photo = photoOpt.get();

        photoRepository.resetMainPhotos(photo.getPerson().getId());

        photo.setIsMain(true);
        return photoRepository.save(photo);
    }

    public void removeMainPhoto(Long personId) {
        photoRepository.resetMainPhotos(personId);
    }

    public Optional<Photo> getMainPhoto(Long personId) {
        return photoRepository.findMainPhotoByPersonId(personId);
    }
}
