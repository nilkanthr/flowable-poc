package com.rakbank.onboarding.delegate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rakbank.onboarding.model.ScreeningResult;
import com.rakbank.onboarding.service.stub.EFRStub;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component("efrDelegate")
public class EFRDelegate implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(EFRDelegate.class);

    @Autowired private EFRStub efrStub;
    @Autowired private ObjectMapper objectMapper;

    @Override
    public void execute(DelegateExecution execution) {
        String companyName   = (String) execution.getVariable("companyName");
        String licenseNumber = (String) execution.getVariable("licenseNumber");

        log.info("[{}] EFR regulatory filing started for: {}", execution.getProcessInstanceId(), companyName);
        ScreeningResult result = efrStub.file(companyName, licenseNumber);
        execution.setVariable("efrResult", toJson(result));
        execution.setVariable("efrReference", result.getMessage());
        log.info("[{}] EFR filing complete — {}", execution.getProcessInstanceId(), result.getMessage());
    }

    private String toJson(Object obj) {
        try { return objectMapper.writeValueAsString(obj); } catch (Exception e) { return "{}"; }
    }
}
