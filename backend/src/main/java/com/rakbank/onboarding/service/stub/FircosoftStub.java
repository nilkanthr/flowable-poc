package com.rakbank.onboarding.service.stub;

import com.rakbank.onboarding.model.ScreeningResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class FircosoftStub {

    @Value("${demo.fircosoft-delay-ms:2500}")
    private long delayMs;

    private static final String[] WATCHLIST_KEYWORDS = {
        "SANCTIONED", "TERRORIST", "BLACKLIST", "OFAC", "SDN"
    };

    public ScreeningResult screen(String companyName, String signatoryName, String scenario) {
        long start = System.currentTimeMillis();
        simulateDelay(delayMs);

        // Force sanctions hit scenario
        if ("SANCTIONS_HIT".equals(scenario)) {
            return ScreeningResult.builder()
                .service("FIRCOSOFT")
                .status("FAIL")
                .code("SANCTIONS_MATCH")
                .message("Exact match found on OFAC SDN List — Entity: " + companyName)
                .score(0.99)
                .durationMs(System.currentTimeMillis() - start)
                .build();
        }

        // Check name against watchlist keywords (for demo)
        String upperName = (companyName + " " + signatoryName).toUpperCase();
        for (String kw : WATCHLIST_KEYWORDS) {
            if (upperName.contains(kw)) {
                return ScreeningResult.builder()
                    .service("FIRCOSOFT")
                    .status("FAIL")
                    .code("SANCTIONS_MATCH")
                    .message("Potential match on UN/OFAC watchlist — manual review required")
                    .score(0.87)
                    .durationMs(System.currentTimeMillis() - start)
                    .build();
            }
        }

        // PEP check — HIGH_RISK triggers PEP
        if ("HIGH_RISK".equals(scenario)) {
            return ScreeningResult.builder()
                .service("FIRCOSOFT")
                .status("REVIEW")
                .code("PEP_MATCH")
                .message("Signatory identified as Politically Exposed Person (PEP) — Level 2")
                .score(0.65)
                .durationMs(System.currentTimeMillis() - start)
                .build();
        }

        return ScreeningResult.builder()
            .service("FIRCOSOFT")
            .status("PASS")
            .code("NO_MATCH")
            .message("No matches found on any watchlist or sanctions list")
            .score(0.02)
            .durationMs(System.currentTimeMillis() - start)
            .build();
    }

    private void simulateDelay(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}
