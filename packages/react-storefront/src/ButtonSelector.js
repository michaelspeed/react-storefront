/**
 * @license
 * Copyright © 2017-2018 Moov Corporation.  All rights reserved.
 */
import classnames from 'classnames'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { PropTypes as MobxPropTypes } from 'mobx-react'
import withStyles from '@material-ui/core/styles/withStyles'
import Button from '@material-ui/core/Button'
import Image from './Image'
import Typography from '@material-ui/core/Typography'
import { inject, observer } from 'mobx-react'

export const styles = theme => ({
  buttons: {
    display: 'flex',
    flexWrap: 'wrap',
    margin: '-4px',
  },
  button: {
    '& button': {
      border: `1px solid ${theme.palette.divider}`,
      padding: 0,
      margin: '4px',
      width: '60px',
      minWidth: '60px',
      height: '40px',
      minHeight: '40px',
      boxShadow: 'none'
    }
  },
  buttonWithImage: {
    '& button': {
      width: '50px',
      minWidth: '50px',
      height: '50px',
      minHeight: '50px'
    }
  },
  selectedImage: {
    '& button': {
      borderWidth: '2px',
      borderColor: theme.typography.body1.color
    }
  },
  selected: {
    '& button': {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '&:hover': {
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText
      }
    }
  },
  imageLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  image: {
    margin: '5px',
    height: '100%',
    width: '100%'
  },
  disabled: {
    backgroundColor: '#f2f2f2',
    color: '#999',
    '& img': {
      opacity: .5
    }
  },
  selectedName: {
    marginTop: '10px'
  }
})

/**
 * A selector for product options rendered as a set of buttons. Buttons can either have 
 * text or an image. The text for the selected option can optionally be displayed below
 * the buttons.
 * 
 * This component supports AMP.
 */
@inject(({ app, ampStateId }) => ({ amp: app.amp, ampStateId }))
@withStyles(styles, { name: 'RSFButtonSelector' })
@observer
export default class ButtonSelector extends Component {
  static propTypes = {
    /**
     * The instance of SelectionModelBase to bind to
     */
    model: MobxPropTypes.objectOrObservableObject.isRequired,

    /**
     * Callback function for tab change
     * Args: event, selectedItem, index
     */
    onSelectionChange: PropTypes.func,

    /**
     * Overridable classes object to allow customization of component
     */
    classes: PropTypes.objectOf(PropTypes.string),

    /**
     * Props for displayed images. See <Image /> component for details
     */
    imageProps: PropTypes.object,

    /**
     * Props for button. See <Button /> component for details
     */
    buttonProps: PropTypes.object,

    /**
     * Set to true to show the name of the selected option in a caption below the buttons
     */
    showSelectedText: PropTypes.bool,

    /**
     * The name of property in amp state to bind to
     */
    name: PropTypes.string,
  }

  static defaultProps = {
    items: [],
    buttonProps: {},
    imageProps: {},
    showSelectedText: false
  }

  render() {
    const { amp, model, ampStateId, name, showSelectedText, classes } = this.props

    if (!model) return null

    return (
      <div className={classes.root}>
        {amp && (
          <input 
            type="hidden" 
            name={name} 
            value={model.selected ? model.selected.id : ''}
            amp-bind={`value=>${ampStateId}.${name}.selected.id`}
          />
        )}
        <div className={classes.buttons}>
          { model.options.map(this.renderButton) }
        </div>
        { showSelectedText && (
          <Typography 
            variant="caption" 
            component="div"
            className={classes.selectedName}
            amp-bind={`text=>${ampStateId}.${name}.selected.text`}
          >
            { model.selected && model.selected.text }
          </Typography>
        )}
      </div>
    )
  }

  createButtonClass = (isSelected, image) => {
    const { button, buttonWithImage, selectedImage, selected } = this.props.classes

    return classnames({
      [button]: true,
      [buttonWithImage]: image != null,
      [selectedImage]: isSelected && image != null,
      [selected]: isSelected && image == null
    })
  }

  renderButton = (option, i) => {
    const { classes, imageProps, buttonProps, model, ampStateId, name } = this.props
    const selected = model.selected && model.selected.id === option.id

    let children = option.text

    if (option.image) {
      children = <Image src={option.image} className={classes.image} fill { ...imageProps } />
    }

    return (
      <div 
        key={option.id}
        className={this.createButtonClass(selected, option.image)}
        amp-bind={`class=>${ampStateId}.${name}.selected.id=="${option.id}" ? "${this.createButtonClass(true, option.image)}" : "${this.createButtonClass(false, option.image)}"`}
      >
        <Button
          onClick={(e) => this.handleClick(e, option, i)}
          href={option.url}
          disabled={option.disabled}
          on={`tap:AMP.setState({ ${ampStateId}: { ${name}: { selected: ${JSON.stringify(option.toJSON())} }}})`}
          classes={{
            label: option.image ? classes.imageLabel : null
          }}
          { ...buttonProps }
        >
          {children}
        </Button>
      </div>
    )
  }

  handleClick = (e, item, index) => {
    const { onSelectionChange, model } = this.props
    
    if (onSelectionChange) {
      onSelectionChange(e, item, index)

      if (e.isDefaultPrevented()) {
        return
      }
    }

    model.setSelected(item)
  }

}