#-- encoding: UTF-8
#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2013 the OpenProject Foundation (OPF)
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
# Copyright (C) 2006-2013 Jean-Philippe Lang
# Copyright (C) 2010-2013 the ChiliProject Team
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
# See doc/COPYRIGHT.rdoc for more details.
#++

class Activity::ChangesetActivityProvider < Activity::BaseActivityProvider

  acts_as_activity_provider type: 'changesets',
                            permission: :view_changesets


  def extend_event_query(query)
    query.join(repositories_table).on(activity_journals_table[:repository_id].eq(repositories_table[:id]))
  end

  def event_query_projection
    [
      activity_journals_table[:revision].as('revision'),
      activity_journals_table[:comments].as('comments'),
      activity_journals_table[:committed_on].as('committed_on'),
      repositories_table[:project_id].as('project_id'),
      repositories_table[:type].as('repository_type')
    ]
  end

  def format_event(event, event_data)
    committed_on = event_data['committed_on']
    committed_date = committed_on.is_a?(String) ? DateTime.parse(committed_on)
                                                : committed_on

    event.event_title = event_title event_data
    event.event_description = split_comment(event_data['comments']).last
    event.event_datetime = committed_date
    event.event_path = event_path event_data
    event.event_url = event_url event_data

    event
  end

  def projects_reference_table
    repositories_table
  end

  private

  def repositories_table
    @repositories_table ||= Arel::Table.new(:repositories)
  end

  def event_title(event)
    ren = self.format_revision(event)

    shomment = self.split_comment(event['comments']).first

    ti "#{l(:label_revision)} #{revision}"
    ti< (short_comment.blank? ? '' : (': ' + short_comment))
  end

  def format_revision(event)
    reory_class = event['repository_type'].constantize

    reory_class.respond_to?(:format_revision) ? repository_class.format_revision(event['revision'])
                                              : event['revision']
  end

  def split_comment(comments)
    cos =~ /\A(.+?)\r?\n(.*)\z/m
    shomments = $1 || comments
    lomments = $2.to_s.strip

    [scomments, long_comments]
  end

  def event_path(event)
    Rails.application.routes.url_helpers.revisions_project_repository_path(url_helper_parameter(event))
  end

  def event_url(event)
    Rails.application.routes.url_helpers.revisions_project_repository_url(url_helper_parameter(event),
                                                                          host: ::Setting.host_name)
  end

  def url_helper_parameter(event)
    { project_id: event['project_id'], rev: event['revision'] }
  end
end
