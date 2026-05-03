package com.rakbank.onboarding.delegate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rakbank.onboarding.model.ScreeningResult;
import com.rakbank.onboarding.service.stub.RiskAssessmentStub;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component("riskAssessmentDelegate")
public class RiskAssessmentDelegate implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(RiskAssessmentDelegate.class);

    @Autowired private RiskAssessmentStub riskAssessmentStub;
    @Autowired private ObjectMapper objectMapper;

    @Override
    public void execute(DelegateExecution execution) {
        String businessActivity = (String) execution.getVariable("businessActivity");
        String annualTurnover   = (String) execution.getVariable("annualTurnover");
        String scenario         = (String) execution.getVariable("scenario");

        List<ScreeningResult> results = new ArrayList<>();
        results.add(fromJson(execution, "fircosoftResult"));
        results.add(fromJson(execution, "aecbResult"));
        results.add(fromJson(execution, "threatMatrixResult"));
        results.add(fromJson(execution, "uaePassResult"));

        log.info("[{}] Risk assessment — aggregating screening results", execution.getProcessInstanceId());
        ScreeningResult risk = riskAssessmentStub.assess(results, businessActivity, annualTurnover, scenario);

        execution.setVariable("riskResult", toJson(risk));
        execution.setVariable("riskScore", risk.getScore());
        execution.setVariable("riskBand", extractBand(risk.getCode()));
        log.info("[{}] Risk complete — score: {}, band: {}", execution.getProcessInstanceId(), risk.getScore(), risk.getCode());
    }

    private ScreeningResult fromJson(DelegateExecution execution, String varName) {
        try {
            String json = (String) execution.getVariable(varName);
            if (json == null) return ScreeningResult.builder().service(varName).status("PASS").score(0).build();
            return objectMapper.readValue(json, ScreeningResult.class);
        } catch (Exception e) {
            return ScreeningResult.builder().service(varName).status("PASS").score(0).build();
        }
    }

    private String toJson(Object obj) {
        try { return objectMapper.writeValueAsString(obj); } catch (Exception e) { return "{}"; }
    }

    private String extractBand(String code) {
        if (code == null) return "LOW";
        if (code.contains("HIGH") || code.contains("CRITICAL")) return "HIGH";
        if (code.contains("MEDIUM")) return "MEDIUM";
        return "LOW";
    }
}
