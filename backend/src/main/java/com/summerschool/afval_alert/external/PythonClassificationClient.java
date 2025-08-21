package com.summerschool.afval_alert.external;

import com.summerschool.afval_alert.model.entity.ClassificationLabel;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
public class PythonClassificationClient {

    private final RestTemplate restTemplate = new RestTemplate();

    public PythonClassificationClient() {}

    public List<Map<String, Object>> classifyImage(byte[] imageBytes) {
        String url = "http://localhost:8000/classificeer";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> requestBody = new LinkedMultiValueMap<>();
        requestBody.add("afbeelding", new ByteArrayResource(imageBytes) {
            // ByteArrayResource serialized zonder naam als string ipv multipart file
            @Override
            public String getFilename() {
                return "afbeelding.jpg";
            }
        });

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<List<Map<String, Object>>> response =
                restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                        new ParameterizedTypeReference<>() {}
                );

        return response.getBody();
    }
}
