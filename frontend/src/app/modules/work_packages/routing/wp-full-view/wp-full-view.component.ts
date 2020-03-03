// -- copyright
// OpenProject is an open source project management software.
// Copyright (C) 2012-2020 the OpenProject GmbH
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See docs/COPYRIGHT.rdoc for more details.
// ++

import {UserResource} from 'core-app/modules/hal/resources/user-resource';
import {WorkPackageResource} from 'core-app/modules/hal/resources/work-package-resource';
import {StateService} from '@uirouter/core';
import {TypeResource} from 'core-app/modules/hal/resources/type-resource';
import {Component, Injector, OnInit} from '@angular/core';
import {WorkPackageViewSelectionService} from 'core-app/modules/work_packages/routing/wp-view-base/view-services/wp-view-selection.service';
import {WorkPackageSingleViewBase} from "core-app/modules/work_packages/routing/wp-view-base/work-package-single-view.base";
import {BackRoutingService} from "core-app/modules/common/back-routing/back-routing.service";

@Component({
  templateUrl: './wp-full-view.html',
  selector: 'wp-full-view-entry',
  // Required class to support inner scrolling on page
  host: { 'class': 'work-packages-page--ui-view' }
})
export class WorkPackagesFullViewComponent extends WorkPackageSingleViewBase implements OnInit {
  // Watcher properties
  public isWatched:boolean;
  public displayWatchButton:boolean;
  public watchers:any;

  // Properties
  public type:TypeResource;
  public author:UserResource;
  public authorPath:string;
  public authorActive:boolean;
  public attachments:any;

  // More menu
  public permittedActions:any;
  public actionsAvailable:any;
  public triggerMoreMenuAction:Function;

  constructor(public injector:Injector,
              public wpTableSelection:WorkPackageViewSelectionService,
              public backRoutingService:BackRoutingService,
              readonly $state:StateService) {
    super(injector, $state.params['workPackageId']);
  }

  ngOnInit():void {
    this.observeWorkPackage();
  }

  protected initializeTexts() {
    super.initializeTexts();

    this.text.full_view = {
      button_more: this.I18n.t('js.button_more')
    };
  }

  protected init() {
    super.init();

    // Set Focused WP
    this.wpTableFocus.updateFocus(this.workPackage.id!);

    this.setWorkPackageScopeProperties(this.workPackage);
    this.text.goBack = this.I18n.t('js.button_back');
  }

  public goBack() {
    this.backRoutingService.goBack();
  }
  private setWorkPackageScopeProperties(wp:WorkPackageResource) {
    this.isWatched = wp.hasOwnProperty('unwatch');
    this.displayWatchButton = wp.hasOwnProperty('unwatch') || wp.hasOwnProperty('watch');

    // watchers
    if (wp.watchers) {
      this.watchers = (wp.watchers as any).elements;
    }

    // Type
    this.type = wp.type;

    // Author
    this.author = wp.author;
    this.authorPath = this.author.showUserPath as string;
    this.authorActive = this.author.isActive;

    // Attachments
    this.attachments = wp.attachments.elements;
  }
}
