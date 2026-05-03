package com.rakbank.onboarding.model;

public class OnboardingRequest {
    private String companyName;
    private String tradeNameEn;
    private String tradeNameAr;
    private String licenseNumber;
    private String licenseType;
    private String licenseAuthority;
    private String licenseExpiryDate;
    private String businessActivity;
    private String annualTurnover;
    private String signatoryName;
    private String signatoryEmirates;
    private String signatoryPassport;
    private String signatoryNationality;
    private String signatoryUaePassId;
    private String email;
    private String phone;
    private String address;
    private String emirate;
    private String scenario;

    public String getCompanyName()         { return companyName; }
    public String getTradeNameEn()         { return tradeNameEn; }
    public String getTradeNameAr()         { return tradeNameAr; }
    public String getLicenseNumber()       { return licenseNumber; }
    public String getLicenseType()         { return licenseType; }
    public String getLicenseAuthority()    { return licenseAuthority; }
    public String getLicenseExpiryDate()   { return licenseExpiryDate; }
    public String getBusinessActivity()    { return businessActivity; }
    public String getAnnualTurnover()      { return annualTurnover; }
    public String getSignatoryName()       { return signatoryName; }
    public String getSignatoryEmirates()   { return signatoryEmirates; }
    public String getSignatoryPassport()   { return signatoryPassport; }
    public String getSignatoryNationality(){ return signatoryNationality; }
    public String getSignatoryUaePassId()  { return signatoryUaePassId; }
    public String getEmail()               { return email; }
    public String getPhone()               { return phone; }
    public String getAddress()             { return address; }
    public String getEmirate()             { return emirate; }
    public String getScenario()            { return scenario; }

    public void setCompanyName(String v)          { this.companyName = v; }
    public void setTradeNameEn(String v)          { this.tradeNameEn = v; }
    public void setTradeNameAr(String v)          { this.tradeNameAr = v; }
    public void setLicenseNumber(String v)        { this.licenseNumber = v; }
    public void setLicenseType(String v)          { this.licenseType = v; }
    public void setLicenseAuthority(String v)     { this.licenseAuthority = v; }
    public void setLicenseExpiryDate(String v)    { this.licenseExpiryDate = v; }
    public void setBusinessActivity(String v)     { this.businessActivity = v; }
    public void setAnnualTurnover(String v)       { this.annualTurnover = v; }
    public void setSignatoryName(String v)        { this.signatoryName = v; }
    public void setSignatoryEmirates(String v)    { this.signatoryEmirates = v; }
    public void setSignatoryPassport(String v)    { this.signatoryPassport = v; }
    public void setSignatoryNationality(String v) { this.signatoryNationality = v; }
    public void setSignatoryUaePassId(String v)   { this.signatoryUaePassId = v; }
    public void setEmail(String v)                { this.email = v; }
    public void setPhone(String v)                { this.phone = v; }
    public void setAddress(String v)              { this.address = v; }
    public void setEmirate(String v)              { this.emirate = v; }
    public void setScenario(String v)             { this.scenario = v; }
}
