package org.family_tree.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

import org.family_tree.model.Photo;

public interface PhotoRepository extends JpaRepository<Photo, Long> {

    List<Photo> findByPersonIdOrderByPhotoDateAsc(Long personId);

    List<Photo> findByPersonIdOrderBySortOrderAsc(Long personId);

    @Query("SELECT p FROM Photo p WHERE p.person.id = :personId ORDER BY p.photoDate ASC, p.sortOrder ASC")
    List<Photo> findPhotosByPersonIdOrderByDate(@Param("personId") Long personId);

    List<Photo> findByPersonId(Long personId);

}