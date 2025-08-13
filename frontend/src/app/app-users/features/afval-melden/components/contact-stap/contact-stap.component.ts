import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent, CardComponent, CardContentComponent, CardFooterComponent, CardHeaderComponent, InputComponent } from '@app/app-users/shared/components/shadcn';
import { MeldingState } from '../../services/melding-state.service';
import { Contact } from '@models/contact';

export type ContactInfo = Partial<Contact>;

@Component({
  selector: 'app-contact-stap',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardContentComponent,
    CardFooterComponent,
    InputComponent
  ],
  templateUrl: './contact-stap.component.html'
})
export class ContactStapComponent {
  private stateService = inject(MeldingState);
  private fb = inject(FormBuilder);
  
  emailError = this.stateService.emailError;
  heeftVorigeStap = this.stateService.heeftVorigeStap;
  contactForm: FormGroup;
  
  constructor() {
    this.contactForm = this.fb.group({
      naam: [''],
      email: ['', [Validators.email]]
    });
    
    // Update form met nieuwste contact informatie
    const contactInfo = this.stateService.contactInfo();
    if (contactInfo) {
      this.contactForm.patchValue(contactInfo);
    }
    
    // Update contact info in state service waneer weizigd in forme
    this.contactForm.valueChanges.subscribe(value => {
      this.stateService.setContactInfo(value);
    });
  }
  
  /**
   * Handler voor het doorgaan naar de volgende stap
   */
  onVolgende(): void {
    if (this.contactForm.valid) {
      this.stateService.gaNaarVolgende();
    }
  }

  /**
   * Handler voor terug naar vorige stap
   */
  onTerug(): void {
    this.stateService.gaTerugNaarVorige();
  }
}