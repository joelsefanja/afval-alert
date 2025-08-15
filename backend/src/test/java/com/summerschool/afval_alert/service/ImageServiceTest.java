package com.summerschool.afval_alert.service;

import com.summerschool.afval_alert.model.entity.Image;
import com.summerschool.afval_alert.repository.ImageRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ImageServiceTest {

    @Mock
    private ImageRepository imageRepository;

    @InjectMocks
    private ImageService imageService;

    @Test
    void saveImage() throws IOException {
        byte[] fileContent = "test content".getBytes();
        MultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", fileContent);

        Image image = new Image();
        image.setId(1L);
        image.setData(fileContent);

        when(imageRepository.save(any(Image.class))).thenReturn(image);

        Image result = imageService.saveImage(file);

        assertNotNull(result);
        assertEquals(image.getId(), result.getId());
        assertArrayEquals(fileContent, result.getData());

        verify(imageRepository, times(1)).save(any(Image.class));
    }

    @Test
    void getImage_found() {
        Image image = new Image();
        image.setId(1L);

        when(imageRepository.findById(1L)).thenReturn(Optional.of(image));

        Image result = imageService.getImage(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());

        verify(imageRepository, times(1)).findById(1L);
    }

    @Test
    void getImage_not_found() {
        when(imageRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> imageService.getImage(1L));
        assertEquals("Image not found", exception.getMessage());

        verify(imageRepository, times(1)).findById(1L);
    }
}
