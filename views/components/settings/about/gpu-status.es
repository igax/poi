import React, { PureComponent } from 'react'
import { remote } from 'electron'
import { Button, Intent } from '@blueprintjs/core'
import { withTranslation } from 'react-i18next'

import { Section } from 'views/components/settings/components/section'

@withTranslation(['setting'])
export class GPUStatus extends PureComponent {
  getGPUFeatureStatus = remote.require('electron').app.getGPUFeatureStatus

  handleClick = () => {
    //As of electron 11, the url 'chrome://gpu' is not working.
    window.open('chrome://gpu', 'plugin[gpuinfo]')
  }

  render() {
    const { t } = this.props
    return (
      <Section title={t('setting:GPU')}>
        <Button minimal intent={Intent.PRIMARY} onClick={this.handleClick}>
          {t('setting:GPU Status')}
        </Button>
      </Section>
    )
  }
}
