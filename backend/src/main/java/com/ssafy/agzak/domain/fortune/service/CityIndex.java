package com.ssafy.agzak.domain.fortune.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.agzak.domain.fortune.dto.response.LatLng;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.regex.Pattern;

// POJO
@Component
public class CityIndex {
    private final Map<String, LatLng> idx = new LinkedHashMap<>();
    private final Map<String, String> normIdx = new HashMap<>();
    private static final Pattern ADMIN_SUFFIX = Pattern.compile("(특별시|광역시|시|군|구)$");

    public CityIndex(ObjectMapper om) throws IOException {
        // classpath: cities.json 로드 (src/main/resources/cities.json)
        try (InputStream is = getClass().getResourceAsStream("/cities.json")) {
            TypeReference<Map<String, Map<String, String>>> type =
                    new TypeReference<>() {};
            Map<String, Map<String, String>> raw = om.readValue(is, type);
            for (var e : raw.entrySet()) {
                String k = e.getKey();
                double lat = Double.parseDouble(e.getValue().get("latitude"));
                double lon = Double.parseDouble(e.getValue().get("longitude"));
                idx.put(k, new LatLng(lat, lon));
                String nk = normalizeKo(k);
                normIdx.merge(nk, k, (oldV, newV) -> newV.length() > oldV.length() ? newV : oldV);
            }
        }
    }

    private String normalizeKo(String s) {
        String noSpace = s.replaceAll("\\s+", "");
        return ADMIN_SUFFIX.matcher(noSpace).replaceFirst("");
    }

    public Optional<Map.Entry<String, LatLng>> find(String query) {
        if (idx.containsKey(query)) {
            return Optional.of(Map.entry(query, idx.get(query)));
        }
        String nq = normalizeKo(query);
        if (normIdx.containsKey(nq)) {
            String key = normIdx.get(nq);
            return Optional.of(Map.entry(key, idx.get(key)));
        }
        // 부분 포함
        return normIdx.entrySet().stream()
                .filter(en -> !nq.isEmpty() && en.getKey().contains(nq))
                .map(en -> Map.entry(en.getValue(), idx.get(en.getValue())))
                .max(Comparator.comparingInt(en -> en.getKey().length()));
    }
}

