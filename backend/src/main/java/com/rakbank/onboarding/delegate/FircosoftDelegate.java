package com.rakbank.onboarding.delegate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rakbank.onboarding.model.ScreeningResult;
import com.rakbank.onboarding.service.stub.FircosoftStub;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component("fircosoftDelegate")
public class FircosoftDelegate implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(FircosoftDelegate.class);

    @Autowired private FircosoftStub fircosoftStub;
    @Autowired private ObjectMapper objectMapper;

    @Override
    public void execute(DelegateExecution execution) {
        String companyName   = (String) execution.getVariable("companyName");
        String signatoryName = (String) execution.getVariable("signatoryName");
        String scenario      = (String) execution.getVariable("scenario");

        log.info("[{}] Fircosoft AML screening started — parallel thread", execution.getProcessInstanceId());
        ScreeningResult result = fircosoftStub.screen(companyName, signatoryName, scenario);
        execution.setVariable("fircosoftResult", toJson(result));
        execution.setVariable("fircosoftStatus", result.getStatus());
        log.info("[{}] Fircosoft result: {} — {}", execution.getProcessInstanceId(), result.getStatus(), result.getMessage());
    }

    private String toJson(Object obj) {
        try { return objectMapper.writeValueAsString(obj); } catch (Exception e) { return "{}"; }
    }
}
