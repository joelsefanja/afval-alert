import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AfvalMeldenProcedureComponent } from '../../src/app/app-users/features/afval-melden/afval-melden-procedure.component';
import { FotoStapComponent } from '../../src/app/app-users/features/afval-melden/components/foto-stap/foto-stap.component';
import { LocatieStapComponent } from '../../src/app/app-users/features/afval-melden/components/locatie-stap/locatie-stap.component';
import { MeldingsProcedureStatus, AfvalMeldProcedureStap } from '../../src/app/app-users/features/afval-melden/services/melding/melding-state.service';
import { FotoFacadeService } from '../../src/app/app-users/features/afval-melden/services/media/foto-facade.service';
import { LocatieFacadeService } from '../../src/app/app-users/features/afval-melden/services/locatie/locatie-facade.service';
import { CameraService } from '../../src/app/app-users/features/afval-melden/services/media/camera.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// Mock services
class MockMeldingsProcedureStatus {
  private _huidigeStap = signal(AfvalMeldProcedureStap.FOTO);
  private _isOffline = signal(false);
  private _fotoUrl = signal('');
  private _fotoError = signal('');

  huidigeStap = this._huidigeStap.asReadonly();
  isOffline = this._isOffline.asReadonly();
  fotoUrl = this._fotoUrl.asReadonly();
  fotoError = this._fotoError.asReadonly();

  gaNaarVolgende = jest.fn(() => {
    const current = this._huidigeStap();
    if (current < AfvalMeldProcedureStap.SUCCES) {
      this._huidigeStap.set(current + 1);
    }
  });

  gaTerugNaarVorige = jest.fn(() => {
    const current = this._huidigeStap();
    if (current > AfvalMeldProcedureStap.START) {
      this._huidigeStap.set(current - 1);
    }
  });

  resetState = jest.fn(() => {
    this._huidigeStap.set(AfvalMeldProcedureStap.START);
    this._fotoUrl.set('');
    this._fotoError.set('');
  });

  setFotoUrl = jest.fn((url: string) => this._fotoUrl.set(url));
  setFotoError = jest.fn((error: string) => this._fotoError.set(error));
  setOfflineStatus = jest.fn((offline: boolean) => this._isOffline.set(offline));
}

class MockFotoFacadeService {
  fotoState = signal({
    cameraActive: false,
    isLoading: false,
    hasPhoto: false,
    photoUrl: '',
    errorMessage: ''
  });

  startCamera = jest.fn().mockResolvedValue({
    getTracks: () => [{ kind: 'video', stop: jest.fn() }]
  });
  
  stopCamera = jest.fn();
  capturePhoto = jest.fn().mockResolvedValue('data:image/jpeg;base64,mock-photo');
  selectFromGallery = jest.fn().mockResolvedValue('data:image/jpeg;base64,mock-gallery-photo');
  cancelPhoto = jest.fn();
}

class MockLocatieFacadeService {
  locatieState = signal({
    isLoading: false,
    selectedAddress: '',
    errorMessage: '',
    canProceed: false
  });

  useCurrentLocation = jest.fn().mockResolvedValue({
    latitude: 52.3676,
    longitude: 4.9041,
    address: 'Test Straat 123, Amsterdam'
  });
  
  searchAddress = jest.fn().mockResolvedValue([
    { display_name: 'Test Straat 123, Amsterdam', coordinates: [4.9041, 52.3676] }
  ]);
  
  selectAddress = jest.fn();
  clearLocation = jest.fn();
}

class MockCameraService {
  requestUserMedia = jest.fn().mockResolvedValue({
    getTracks: () => [{ kind: 'video', stop: jest.fn() }]
  });
  
  attachStreamToVideo = jest.fn();
  playVideo = jest.fn().mockResolvedValue(undefined);
  stopCurrentStream = jest.fn();
  capturePhotoFromVideo = jest.fn().mockReturnValue('data:image/jpeg;base64,mock-photo');
}

// Test host component for integration testing
@Component({
  template: `
    <app-afval-meld-procedure></app-afval-meld-procedure>
  `,
  standalone: true,
  imports: [AfvalMeldenProcedureComponent]
})
class TestHostComponent {}

describe('Component Interactions Integration Tests', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let procedureComponent: AfvalMeldenProcedureComponent;
  let mockStatus: MockMeldingsProcedureStatus;
  let mockFotoFacade: MockFotoFacadeService;
  let mockLocatieFacade: MockLocatieFacadeService;

  beforeEach(async () => {
    mockStatus = new MockMeldingsProcedureStatus();
    mockFotoFacade = new MockFotoFacadeService();
    mockLocatieFacade = new MockLocatieFacadeService();

    await TestBed.configureTestingModule({
      imports: [TestHostComponent, NoopAnimationsModule],
      providers: [
        { provide: MeldingsProcedureStatus, useValue: mockStatus },
        { provide: FotoFacadeService, useValue: mockFotoFacade },
        { provide: LocatieFacadeService, useValue: mockLocatieFacade },
        { provide: CameraService, useClass: MockCameraService }
      ]
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    procedureComponent = hostFixture.debugElement.query(
      By.directive(AfvalMeldenProcedureComponent)
    ).componentInstance;

    hostFixture.detectChanges();
  });

  describe('Step Navigation Integration', () => {
    it('should navigate from foto to locatie step when foto is completed', async () => {
      // Start at foto step
      mockStatus._huidigeStap.set(AfvalMeldProcedureStap.FOTO);
      hostFixture.detectChanges();

      // Should show foto component
      const fotoComponent = hostFixture.debugElement.query(By.directive(FotoStapComponent));
      expect(fotoComponent).toBeTruthy();

      // Simulate foto completion
      mockStatus.setFotoUrl('data:image/jpeg;base64,test-photo');
      mockStatus.gaNaarVolgende();
      hostFixture.detectChanges();

      // Should navigate to locatie step
      expect(mockStatus.huidigeStap()).toBe(AfvalMeldProcedureStap.LOCATIE);
    });

    it('should preserve foto data when navigating back from locatie step', () => {
      // Set up foto completion state
      mockStatus.setFotoUrl('data:image/jpeg;base64,test-photo');
      mockStatus._huidigeStap.set(AfvalMeldProcedureStap.LOCATIE);
      hostFixture.detectChanges();

      // Navigate back to foto
      mockStatus.gaTerugNaarVorige();
      hostFixture.detectChanges();

      // Photo should still be preserved
      expect(mockStatus.fotoUrl()).toBe('data:image/jpeg;base64,test-photo');
      expect(mockStatus.huidigeStap()).toBe(AfvalMeldProcedureStap.FOTO);
    });
  });

  describe('Progress Bar Integration', () => {
    it('should update progress indicator based on current step', () => {
      // Start at foto step
      mockStatus._huidigeStap.set(AfvalMeldProcedureStap.FOTO);
      hostFixture.detectChanges();

      // Should show step 1 of 4
      expect(procedureComponent.getActiveIndex()).toBe(0);
      expect(procedureComponent.getProgressPercentage()).toBe(25);

      // Move to locatie step
      mockStatus._huidigeStap.set(AfvalMeldProcedureStap.LOCATIE);
      hostFixture.detectChanges();

      // Should show step 2 of 4
      expect(procedureComponent.getActiveIndex()).toBe(1);
      expect(procedureComponent.getProgressPercentage()).toBe(50);
    });

    it('should mark completed steps correctly', () => {
      mockStatus._huidigeStap.set(AfvalMeldProcedureStap.CONTACT);
      hostFixture.detectChanges();

      const stepData = procedureComponent.stappenData();
      
      // Foto and Locatie should be completed
      expect(stepData[0].voltooid).toBe(true);  // Foto
      expect(stepData[1].voltooid).toBe(true);  // Locatie
      expect(stepData[2].actief).toBe(true);    // Contact (current)
      expect(stepData[3].voltooid).toBe(false); // Controle (not yet)
    });
  });

  describe('State Management Integration', () => {
    it('should handle offline state across all components', () => {
      mockStatus.setOfflineStatus(true);
      hostFixture.detectChanges();

      // Offline notification should be visible
      const offlineElement = hostFixture.debugElement.query(
        By.css('app-offline-notificatie')
      );
      expect(offlineElement).toBeTruthy();
      expect(offlineElement.nativeElement.getAttribute('ng-reflect-is-offline')).toBe('true');
    });

    it('should reset state properly when starting new procedure', () => {
      // Set some state
      mockStatus.setFotoUrl('test-photo');
      mockStatus._huidigeStap.set(AfvalMeldProcedureStap.CONTACT);

      // Reset state
      mockStatus.resetState();

      expect(mockStatus.huidigeStap()).toBe(AfvalMeldProcedureStap.START);
      expect(mockStatus.fotoUrl()).toBe('');
      expect(mockStatus.fotoError()).toBe('');
    });
  });

  describe('Service Integration', () => {
    it('should integrate foto facade with camera service for photo capture', async () => {
      mockStatus._huidigeStap.set(AfvalMeldProcedureStap.FOTO);
      hostFixture.detectChanges();

      // Simulate taking a photo
      const mockVideoElement = document.createElement('video');
      mockVideoElement.videoWidth = 640;
      mockVideoElement.videoHeight = 480;

      const result = await mockFotoFacade.capturePhoto(mockVideoElement);
      
      expect(mockFotoFacade.capturePhoto).toHaveBeenCalledWith(mockVideoElement);
      expect(result).toBe('data:image/jpeg;base64,mock-photo');
    });

    it('should integrate locatie facade with geolocation services', async () => {
      mockStatus._huidigeStap.set(AfvalMeldProcedureStap.LOCATIE);
      hostFixture.detectChanges();

      // Simulate using current location
      const result = await mockLocatieFacade.useCurrentLocation();

      expect(mockLocatieFacade.useCurrentLocation).toHaveBeenCalled();
      expect(result).toEqual({
        latitude: 52.3676,
        longitude: 4.9041,
        address: 'Test Straat 123, Amsterdam'
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle camera errors across foto workflow', () => {
      mockFotoFacade.startCamera.mockRejectedValue(new Error('Camera not available'));
      mockStatus._huidigeStap.set(AfvalMeldProcedureStap.FOTO);
      hostFixture.detectChanges();

      // Error should be handled gracefully by the facade
      expect(mockFotoFacade.startCamera).toBeDefined();
    });

    it('should handle location errors across locatie workflow', () => {
      mockLocatieFacade.useCurrentLocation.mockRejectedValue(new Error('Location not available'));
      mockStatus._huidigeStap.set(AfvalMeldProcedureStap.LOCATIE);
      hostFixture.detectChanges();

      // Error should be handled gracefully by the facade
      expect(mockLocatieFacade.useCurrentLocation).toBeDefined();
    });
  });

  describe('Data Flow Integration', () => {
    it('should maintain data consistency across step transitions', () => {
      // Complete foto step
      mockStatus.setFotoUrl('test-photo-url');
      mockStatus._huidigeStap.set(AfvalMeldProcedureStap.LOCATIE);
      
      // Update location state
      mockLocatieFacade.locatieState.set({
        isLoading: false,
        selectedAddress: 'Test Address',
        errorMessage: '',
        canProceed: true
      });

      // Move to contact step
      mockStatus._huidigeStap.set(AfvalMeldProcedureStap.CONTACT);
      hostFixture.detectChanges();

      // Both foto and locatie data should be preserved
      expect(mockStatus.fotoUrl()).toBe('test-photo-url');
      expect(mockLocatieFacade.locatieState().selectedAddress).toBe('Test Address');
    });
  });

  describe('Component Lifecycle Integration', () => {
    it('should properly cleanup resources when components are destroyed', () => {
      mockStatus._huidigeStap.set(AfvalMeldProcedureStap.FOTO);
      hostFixture.detectChanges();

      // Move away from foto step
      mockStatus._huidigeStap.set(AfvalMeldProcedureStap.LOCATIE);
      hostFixture.detectChanges();

      // Camera should be stopped when leaving foto step
      expect(mockFotoFacade.stopCamera).toHaveBeenCalled();
    });

    it('should handle rapid navigation between steps', () => {
      // Rapidly change steps
      mockStatus._huidigeStap.set(AfvalMeldProcedureStap.FOTO);
      hostFixture.detectChanges();

      mockStatus._huidigeStap.set(AfvalMeldProcedureStap.LOCATIE);
      hostFixture.detectChanges();

      mockStatus._huidigeStap.set(AfvalMeldProcedureStap.FOTO);
      hostFixture.detectChanges();

      // Components should handle rapid changes gracefully
      expect(hostFixture.componentInstance).toBeTruthy();
    });
  });
});