import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ContactStapService } from '../../services/contact/contact-stap.service';

@Component({
  selector: 'app-contact-stap',
  standalone: true,
  imports: [FormsModule, ButtonModule, CardModule, InputTextModule, CheckboxModule],
  templateUrl: './contact-stap.component.html'
})
export class ContactStapComponent {
  private contactService: ContactStapService = inject(ContactStapService);
  
  readonly naam = this.contactService.naam;
  readonly email = this.contactService.email;
  readonly anoniem = this.contactService.anoniem;
  readonly isFormValid = this.contactService.isFormValid;
  readonly isEmailValid = this.contactService.isEmailValid;

  setNaam(naam: string) {
    this.contactService.setNaam(naam);
  }

  setEmail(email: string) {
    this.contactService.setEmail(email);
  }

  setAnoniem(anoniem: boolean) {
    this.contactService.setAnoniem(anoniem);
  }

  prev() {
    this.contactService.prev();
  }

  next() {
    this.contactService.saveAndNext();
  }
}