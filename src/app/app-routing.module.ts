import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LegalPageComponent } from './legal-page/legal-page.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { TermsOfServicePageComponent } from './terms-of-service-page/terms-of-service-page.component';
import { PrivacyPolicyPageComponent } from './privacy-policy-page/privacy-policy-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TranscriptionDetailComponent } from './transcription-detail/transcription-detail.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'legal', component: LegalPageComponent },
  { path: 'legal/PrivacyPolicy', component: PrivacyPolicyPageComponent },
  { path: 'legal/TermsOfService', component: TermsOfServicePageComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'transcription/:id', component: TranscriptionDetailComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { };