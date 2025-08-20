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

@Component
public class PythonClassificationClient {

    private final RestTemplate restTemplate = new RestTemplate();

    public PythonClassificationClient() {}

    public List<ClassificationLabel> classifyImage(byte[] imageBytes) {
        String url = "http://localhost:8000/classificatie";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> requestBody = new LinkedMultiValueMap<>();
        requestBody.add("image", new ByteArrayResource(imageBytes));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<List<ClassificationLabel>> response =
                restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                        new ParameterizedTypeReference<>() {}
                );

        return response.getBody();
    }
}
