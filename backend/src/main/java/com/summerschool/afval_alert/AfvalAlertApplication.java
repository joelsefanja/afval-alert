package com.summerschool.afval_alert;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AfvalAlertApplication {

	public static void main(String[] args) {
		SpringApplication.run(AfvalAlertApplication.class, args);
	}

}
