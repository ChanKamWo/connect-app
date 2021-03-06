/**
 * Milestone type 'add-links`
 */
import React from 'react'
import PT from 'prop-types'
import _ from 'lodash'
import cn from 'classnames'

import DotIndicator from '../../DotIndicator'
import LinkList from '../../LinkList'
import MilestonePostMessage from '../../MilestonePostMessage'
import ProjectProgress from '../../../ProjectProgress'
import MilestoneDescription from '../../MilestoneDescription'
import { withMilestoneExtensionRequest } from '../../MilestoneExtensionRequest'
import { getMilestoneStatusText, getDaysLeft, getTotalDays, getProgressPercent} from '../../../../../../helpers/milestoneHelper'

import {
  MILESTONE_STATUS
} from '../../../../../../config/constants'

import './MilestoneTypeAddLinks.scss'
import { hasPermission } from '../../../../../../helpers/permissions'
import { PERMISSIONS } from '../../../../../../config/permissions'

class MilestoneTypeAddLinks extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      addedLinks: [],
      isShowCompleteConfirmMessage: false,
      isLinkUpdating: false,
      showExtensionRequestSection: true
    }

    this.addUrl = this.addUrl.bind(this)
    this.removeUrl = this.removeUrl.bind(this)
    this.showCompleteAddLinksConfirmation = this.showCompleteAddLinksConfirmation.bind(this)
    this.hideCompleteAddLinksConfirmation = this.hideCompleteAddLinksConfirmation.bind(this)
    this.complete = this.complete.bind(this)
    this.toggleRejectedSection = this.toggleRejectedSection.bind(this)
    this.onFormAddOpen = this.onFormAddOpen.bind(this)
    this.onFormAddCancel = this.onFormAddCancel.bind(this)
  }

  onFormAddOpen() {
    this.setState({ showExtensionRequestSection: false })
  }

  onFormAddCancel() {
    this.setState({ showExtensionRequestSection: true })
  }

  showCompleteAddLinksConfirmation() {
    this.setState({ isShowCompleteConfirmMessage: true })
  }

  hideCompleteAddLinksConfirmation() {
    this.setState({ isShowCompleteConfirmMessage: false })
  }

  complete() {
    //$TODO add call to send data to next milestone
    const { addedLinks } = this.state
    const { milestone, completeMilestone } = this.props

    // when we change status to completed, we also save which links were selected
    completeMilestone({
      details: {
        ...milestone.details,
        content: {
          ..._.get(milestone, 'details.content', {}),
          links: addedLinks
        }
      }
    })
  }

  /**
   * toggles open closed states of rejected section
   */
  toggleRejectedSection() {
    this.setState({
      isRejectedExpanded: !this.state.isRejectedExpanded
    })
  }

  addUrl(values) {
    const { addedLinks } = this.state
    values.type = 'marvelapp'

    // here we simulate uploading process for LinkList component
    // as that component is uncontrollable and relies on the `isUpdating` property
    this.setState({
      isLinkUpdating: true,
    }, () => {
      this.setState({
        addedLinks: [...addedLinks, values],
        isLinkUpdating: false,
      })
    })
  }

  removeUrl(linkIndex) {
    if (!window.confirm('Are you sure you want to remove this link?')) {
      return
    }
    const { addedLinks } = this.state
    addedLinks.splice(linkIndex, 1)
    this.setState({
      addedLinks,
    })
  }

  render() {
    const {
      milestone,
      theme,
      extensionRequestDialog,
      extensionRequestButton,
      extensionRequestConfirmation,
    } = this.props
    const {
      addedLinks,
      isShowCompleteConfirmMessage,
      isLinkUpdating,
    } = this.state

    const isActive = milestone.status === MILESTONE_STATUS.ACTIVE
    const isCompleted = milestone.status === MILESTONE_STATUS.COMPLETED

    const daysLeft = getDaysLeft(milestone)
    const totalDays = getTotalDays(milestone)

    const progressText = daysLeft >= 0
      ? `${daysLeft} days until designs are completed`
      : `${-daysLeft} days designs are delayed`

    const progressPercent = getProgressPercent(totalDays, daysLeft)
    const { showExtensionRequestSection } = this.state

    const canManage = hasPermission(PERMISSIONS.MANAGE_MILESTONE)

    return (
      <div styleName={cn('milestone-post', theme)}>
        <DotIndicator hideDot>
          <MilestoneDescription description={getMilestoneStatusText(milestone)} />
        </DotIndicator>

        {/*
          Active status
         */}
        {isActive && (
          <div>
            <div>
              <DotIndicator hideDot={!canManage && extensionRequestConfirmation}>
                <div styleName="top-space">
                  <ProjectProgress
                    labelDayStatus={progressText}
                    progressPercent={progressPercent}
                    theme={daysLeft < 0 ? 'warning' : 'light'}
                    readyForReview
                  />
                </div>
              </DotIndicator>

              {canManage && (
                <DotIndicator hideLine>
                  <LinkList
                    links={addedLinks}
                    onAddLink={this.addUrl}
                    onRemoveLink={this.removeUrl}
                    onUpdateLink={this.addUrl}
                    fields={[{
                      name: 'title',
                      value: `Design ${addedLinks.length + 1}`,
                      maxLength: 64,
                    }, {
                      name: 'url'
                    }]}
                    addButtonTitle="Add design link"
                    formAddTitle="Add design link"
                    formAddButtonTitle="Add link"
                    formUpdateTitle="Editing a link"
                    formUpdateButtonTitle="Save changes"
                    isUpdating={isLinkUpdating}
                    fakeName={`Design ${addedLinks.length + 1}`}
                    onFormAddOpen={this.onFormAddOpen}
                    onFormAddCancel={this.onFormAddCancel}
                    canAddLink
                  />
                </DotIndicator>
              )}
            </div>

            {!!extensionRequestDialog && (
              <DotIndicator hideLine>
                <div styleName="top-space">
                  {extensionRequestDialog}
                </div>
              </DotIndicator>
            )}

            {!!extensionRequestConfirmation && (
              <DotIndicator hideLine={canManage}>
                <div styleName="top-space">
                  {extensionRequestConfirmation}
                </div>
              </DotIndicator>
            )}

            {isShowCompleteConfirmMessage && (
              <DotIndicator hideLine>
                <div styleName="top-space">
                  <MilestonePostMessage
                    label={'Complete Adding Links'}
                    theme="warning"
                    message={'Warning! Complete the milestone only if you are done with adding links. You will not be able to add links once completed.'}
                    isShowSelection={false}
                    buttons={[
                      { title: 'Cancel', onClick: this.hideCompleteAddLinksConfirmation, type: 'default' },
                      { title: 'Complete', onClick: this.complete, type: 'warning' },
                    ]}
                  />
                </div>
              </DotIndicator>
            )}

            {
              !isCompleted &&
              !extensionRequestDialog &&
              !isShowCompleteConfirmMessage &&
              canManage && showExtensionRequestSection &&
            (
              <DotIndicator hideLine>
                <div styleName="action-bar" className="flex center">
                  {canManage && (
                    <button
                      className={'tc-btn tc-btn-primary'}
                      onClick={canManage ? this.showCompleteAddLinksConfirmation : this.complete}
                    >
                      Complete
                    </button>
                  )}
                  {canManage && extensionRequestButton}
                </div>
              </DotIndicator>
            )}
          </div>
        )}

      </div>
    )
  }
}

MilestoneTypeAddLinks.defaultProps = {
  theme: null,
}

MilestoneTypeAddLinks.propTypes = {
  completeMilestone: PT.func.isRequired,
  milestone: PT.object.isRequired,
  theme: PT.string,
  updateMilestoneContent: PT.func.isRequired,
  extensionRequestDialog: PT.node,
  extensionRequestButton: PT.node,
  extensionRequestConfirmation: PT.node,
}

export default withMilestoneExtensionRequest(MilestoneTypeAddLinks)
