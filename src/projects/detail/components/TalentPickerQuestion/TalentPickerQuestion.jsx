import React, { Component, PropTypes } from 'react'
import _ from 'lodash'
import { HOC as hoc } from 'formsy-react'
import cn from 'classnames'

import TalentPickerRow from '../TalentPickerRow/TalentPickerRow'
import './TalentPickerQuestion.scss'

class TalentPickerQuestion extends Component {

  constructor(props) {
    super(props)

    this.state = {
      options: []
    }

    this.getDefaultValue = this.getDefaultValue.bind(this)
    this.handleValueChange = this.handleValueChange.bind(this)

    this.insertRole = this.insertRole.bind(this)
    this.removeRole = this.removeRole.bind(this)
    this.canDeleteRole = this.canDeleteRole.bind(this)
    this.setValidator(props)
  }

  componentWillReceiveProps(nextProps) {
    this.setValidator(nextProps)


    if (!_.isEqual(this.props.options, nextProps.options)) {
      this.updateOptions(nextProps)
    }
  }

  componentDidMount() {
    this.updateOptions(this.props)
  }

  setValidator(props) {
    const { setValidations, required } = props
    const validations = {
      oneRowHaveValidValue: (formValues, value) => {
        if (!required) {
          return true
        }
        return _.some(value, (v) => {
          return v.people !== '0' && v.duration !== '0' && v.skills.length > 0
        }) // validation body
      },
      noPartialFillsExist: (formValues, value) => {
        return _.every(value, v => {
          const isOneValueFilled = v.people > 0 || v.duration > 0 || (v.skills && v.skills.length)
          const isAllValuesFilled = v.people > 0 && v.duration > 0 && v.skills && v.skills.length

          // If one value is filled, all values should be filled to make this row valid. Partial fill is not valid
          const isRowValid = !isOneValueFilled || isAllValuesFilled
          return isRowValid
        })
      }
    }
    setValidations(validations)
  }

  updateOptions(props) {
    const options = props.options.map(o => ({...o, skillsCategories: o.skillsCategory ? [ o.skillsCategory ] : null}))
    this.setState({ options })
  }

  getDefaultValue() {
    const { options } = this.props
    return options.map((o) => ({
      role: o.role,
      people: '0',
      duration: '0',
      skills: [],
    }))
  }

  onChange(value) {
    const {setValue, name} = this.props

    setValue(value)
    this.props.onChange(name, value)
  }

  handleValueChange(index, field, value) {
    const { getValue } = this.props
    let values = getValue() || this.getDefaultValue()
    values = [...values.slice(0, index), { ...values[index], [field]: value }, ...values.slice(index + 1)]

    this.onChange(values)
  }

  insertRole(index, role) {
    const { getValue } = this.props
    let values = getValue() || this.getDefaultValue()

    values = [
      ...values.slice(0, index),
      {
        role,
        people: '0',
        duration: '0',
        skills: [],
      },
      ...values.slice(index)
    ]
    this.onChange(values)
  }

  removeRole(index) {
    const { getValue } = this.props
    let values = getValue() || this.getDefaultValue()
    values = [...values.slice(0, index), ...values.slice(index + 1)]
    this.onChange(values)
  }

  canDeleteRole(role, index) {
    const { getValue } = this.props
    const values = getValue() || this.getDefaultValue()
    return _.findIndex(values, { role }) !== index
  }

  render() {
    const { wrapperClass, getValue } = this.props
    const { options } = this.state

    const errorMessage =
      this.props.getErrorMessage() || this.props.validationError
    const hasError = !this.props.isPristine() && !this.props.isValid()

    const values = getValue() || this.getDefaultValue()

    return (
      <div className={cn(wrapperClass)}>
        <div styleName="container">
          {options.length > 0 ? values.map((v, roleIndex) => {
            const roleSetting = _.find(options, { role: v.role })
            return (
              <TalentPickerRow
                key={roleIndex}
                rowIndex={roleIndex}
                value={v}
                canBeDeleted={this.canDeleteRole}
                roleSetting={roleSetting}
                onChange={this.handleValueChange}
                onDeleteRow={this.removeRole}
                onAddRow={this.insertRole}
              />
            )
          }) : null}
        </div>
        {hasError ? <p className="error-message">{errorMessage}</p> : null}
      </div>
    )
  }
}

TalentPickerQuestion.PropTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      role: PropTypes.string.isRequired,
      skillsCategory: PropTypes.string.isRequired,
      roleTitle: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  onChange: PropTypes.func,
}

TalentPickerQuestion.defaultProps = {
  onChange: _.noop
}

export default hoc(TalentPickerQuestion)
