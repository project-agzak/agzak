package com.ssafy.agzak.domain.fortune.service;


import com.ssafy.agzak.domain.fortune.dto.request.BirthDataInput;
import com.ssafy.agzak.domain.fortune.dto.response.AiPromptData;
import com.ssafy.agzak.domain.fortune.dto.response.AspectInfo;
import com.ssafy.agzak.domain.fortune.dto.response.NatalPlanetInfo;
import com.ssafy.agzak.domain.fortune.dto.response.TransitPlanetInfo;
import org.springframework.stereotype.Service;
import swisseph.SweConst;
import swisseph.SweDate;
import swisseph.SwissEph;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

//Swiss Ephemeris 라이브러리를 사용하여 점성술 데이터를 계산하는 서비스
@Service
public class AstrologyCalculationService {

    private SwissEph swissEph;
    private final String EPHE_PATH = "src/main/resources/ephe";

    private static final Map<Integer, String> PLANETS_MAP = Map.of(
            SweConst.SE_SUN, "Sun",
            SweConst.SE_MOON, "Moon",
            SweConst.SE_MERCURY, "Mercury",
            SweConst.SE_VENUS, "Venus",
            SweConst.SE_MARS, "Mars",
            SweConst.SE_JUPITER, "Jupiter",
            SweConst.SE_SATURN, "Saturn"
    );
    private static final String[] ZODIAC_SIGNS = {
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    };

    public AstrologyCalculationService() {
        this.swissEph = new SwissEph(EPHE_PATH);
    }

    public AiPromptData generateAiPromptData(BirthDataInput input) {

        ZoneId birthZone = ZoneId.of("Asia/Seoul");
        ZonedDateTime natalZonedTime = input.birthDateTime().atZone(birthZone);
        ZonedDateTime natalUtTime = natalZonedTime.withZoneSameInstant(ZoneId.of("UTC"));
        ZonedDateTime transitUtTime = ZonedDateTime.now(ZoneId.of("UTC"));

        double natalJulDay = getJulianDay(natalUtTime);
        double transitJulDay = getJulianDay(transitUtTime);

        double[] cusps = new double[13];
        double[] ascmc = new double[10];

        int iflags = 0;
        int houseSystem = SweConst.SE_HSYS_PLACIDUS;

        swissEph.swe_houses(natalJulDay, iflags, input.latitude(), input.longitude(), houseSystem, cusps, ascmc);

        String ascendantSign = getSignWithDegree(ascmc[SweConst.SE_ASC]);
        String mcSign = getSignWithDegree(ascmc[SweConst.SE_MC]);

        List<NatalPlanetInfo> natalPlanets = new ArrayList<>();
        for (Map.Entry<Integer, String> entry : PLANETS_MAP.entrySet()) {
            double[] results = calculatePlanetPosition(natalJulDay, entry.getKey());
            double longitude = results[0];

            natalPlanets.add(new NatalPlanetInfo(
                    entry.getValue(),
                    getSignWithDegree(longitude),
                    longitude,
                    getHousePosition(longitude, cusps)
            ));
        }

        // 4. 현재 행성 위치 계산
        List<TransitPlanetInfo> transitPlanets = new ArrayList<>();
        for (Map.Entry<Integer, String> entry : PLANETS_MAP.entrySet()) {
            double[] results = calculatePlanetPosition(transitJulDay, entry.getKey());
            double longitude = results[0];

            transitPlanets.add(new TransitPlanetInfo(
                    entry.getValue(),
                    getSignWithDegree(longitude),
                    longitude
            ));
        }

        // 5. 어스펙트(Aspects) 계산
        List<AspectInfo> aspects = calculateAspects(transitPlanets, natalPlanets);

        return new AiPromptData(natalPlanets, transitPlanets, aspects, ascendantSign, mcSign);
    }


    private double getJulianDay(ZonedDateTime utTime) {
        double utHour = utTime.getHour() + (utTime.getMinute() / 60.0) + (utTime.getSecond() / 3600.0);
        SweDate sweDate = new SweDate(utTime.getYear(), utTime.getMonthValue(), utTime.getDayOfMonth(), utHour, SweDate.SE_GREG_CAL);
        return sweDate.getJulDay();
    }

    private double[] calculatePlanetPosition(double julianDay, int planetId) {
        double[] results = new double[6];
        StringBuffer errorBuffer = new StringBuffer();
        int flags = SweConst.SEFLG_SPEED;

        int result = swissEph.swe_calc_ut(julianDay, planetId, flags, results, errorBuffer);
        if (result < 0) {
            System.err.println("Warning: " + errorBuffer.toString());
        }
        return results;
    }

    private String getSignWithDegree(double longitude) {
        String sign = ZODIAC_SIGNS[(int) Math.floor(longitude / 30.0)];
        double degree = longitude % 30.0;
        return String.format("%s %.1f°", sign, degree);
    }

    private int getHousePosition(double planetLongitude, double[] cusps) {
        double cusp1 = cusps[1];
        if (cusp1 < cusps[12]) cusp1 += 360.0;
        if (planetLongitude < cusps[1]) planetLongitude += 360.0;

        for (int i = 1; i <= 12; i++) {
            double cuspStart = (i == 1) ? cusps[1] : cusps[i];
            double cuspEnd = (i == 12) ? cusp1 : cusps[i + 1];

            if (cuspEnd < cuspStart) cuspEnd += 360.0;
            if (planetLongitude < cuspStart) planetLongitude += 360.0;

            if (planetLongitude >= cuspStart && planetLongitude < cuspEnd) {
                return i;
            }
        }
        return 1;
    }

    private List<AspectInfo> calculateAspects(List<TransitPlanetInfo> transits, List<NatalPlanetInfo> natals) {
        List<AspectInfo> aspects = new ArrayList<>();
        double orb = 5.0; // 허용 오차 범위

        for (TransitPlanetInfo transit : transits) {
            for (NatalPlanetInfo natal : natals) {
                double angle = Math.abs(transit.longitude() - natal.longitude());
                if (angle > 180.0) angle = 360.0 - angle;

                checkAspect(aspects, transit.name(), natal.name(), angle, 0.0, "Conjunction (0°)", orb);
                checkAspect(aspects, transit.name(), natal.name(), angle, 60.0, "Sextile (60°)", orb);
                checkAspect(aspects, transit.name(), natal.name(), angle, 90.0, "Square (90°)", orb);
                checkAspect(aspects, transit.name(), natal.name(), angle, 120.0, "Trine (120°)", orb);
                checkAspect(aspects, transit.name(), natal.name(), angle, 180.0, "Opposition (180°)", orb);
            }
        }
        return aspects;
    }

    private void checkAspect(List<AspectInfo> aspects, String tName, String nName, double angle, double aspectAngle, String aspectName, double orb) {
        double orbDiff = Math.abs(angle - aspectAngle);
        if (orbDiff <= orb) {
            aspects.add(new AspectInfo(tName, aspectName, nName, orbDiff));
        }
    }
}