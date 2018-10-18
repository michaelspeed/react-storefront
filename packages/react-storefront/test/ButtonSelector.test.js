/**
 * @license
 * Copyright © 2017-2018 Moov Corporation.  All rights reserved.
 */
import React from 'react'
import { mount } from 'enzyme'
import ButtonSelector from '../src/ButtonSelector'
import SelectionModelBase from '../src/model/SelectionModelBase'
import { Provider } from 'mobx-react'
import AppModelBase from '../src/model/AppModelBase'
import AmpState from '../src/amp/AmpState'

describe('ButtonSelector', () => {
  let app, selection

  beforeEach(() => {
    app = AppModelBase.create({})
    selection = SelectionModelBase.create({
      options: [
        { id: '1', text: 'One' },
        { id: '2', text: 'Two' },
        { id: '3', text: 'Three' },
      ],
      selected: { id: '2', text: 'Two'}
    })
  })

  it('should render buttons with text', () => {
    expect(mount(
      <Provider app={app}>
        <ButtonSelector model={selection}/>
      </Provider>
    )).toMatchSnapshot()
  })

  it('should render buttons with images', () => {
    selection = SelectionModelBase.create({
      options: [
        { id: '1', image: 'http://via.placeholder.com/128x128/ffffff' },
        { id: '2', image: 'http://via.placeholder.com/128x128/000000' }
      ],
      selected: { id: '2', image: 'http://via.placeholder.com/128x128/000000' }
    })

    expect(mount(
      <Provider app={app}>
        <ButtonSelector model={selection}/>
      </Provider>
    )).toMatchSnapshot()
  })

  it('should support amp', () => {
    app.applyState({ amp: true })

    expect(mount(
      <Provider app={app}>
        <AmpState>
          <ButtonSelector model={selection}/>
        </AmpState>
      </Provider>
    )).toMatchSnapshot()
  })

  it('should render links for options with urls', () => {
    selection = SelectionModelBase.create({
      options: [
        { id: '1', image: 'http://via.placeholder.com/128x128/ffffff', url: '/foo' },
        { id: '2', image: 'http://via.placeholder.com/128x128/000000', url: '/bar' }
      ],
      selected: { id: '2', image: 'http://via.placeholder.com/128x128/000000', url: '/bar' }
    })

    expect(mount(
      <Provider app={app}>
        <AmpState>
          <ButtonSelector model={selection}/>
        </AmpState>
      </Provider>
    )).toMatchSnapshot()
  })

  it('should disable buttons for disabled options', () => {
    selection = SelectionModelBase.create({
      options: [
        { id: '1', disabled: true, image: 'http://via.placeholder.com/128x128/ffffff' },
        { id: '2', image: 'http://via.placeholder.com/128x128/000000' }
      ],
      selected: { id: '2', image: 'http://via.placeholder.com/128x128/000000' }
    })

    const wrapper = mount(
      <Provider app={app}>
        <ButtonSelector model={selection}/>
      </Provider>
    )

    expect(wrapper.find('button').at(0).prop('disabled')).toBe(true)
  })

  it('should change the selection when a button is clicked', () => {
    const wrapper = mount(
      <Provider app={app}>
        <ButtonSelector model={selection}/>
      </Provider>
    )

    wrapper.find('button').at(0).simulate('click')

    expect(selection.selected.id).toBe('1')
  })

  it('should call onSelectionChange', () => {
    let called = false

    const onSelectionChange = e => called = true

    const wrapper = mount(
      <Provider app={app}>
        <ButtonSelector model={selection} onSelectionChange={onSelectionChange}/>
      </Provider>
    )

    wrapper.find('button').at(0).simulate('click')

    expect(called).toBe(true)
  })


  it('should allow the developer to cancel the selection changed by calling e.preventDefault()', () => {
    const onSelectionChange = e => e.preventDefault()

    const wrapper = mount(
      <Provider app={app}>
        <ButtonSelector model={selection} onSelectionChange={onSelectionChange}/>
      </Provider>
    )

    wrapper.find('button').at(0).simulate('click')

    expect(selection.selected.id).toBe('2')
  })

  it('should show the text of the selected option', () => {
    expect(mount(
      <Provider app={app}>
        <ButtonSelector model={selection} showSelectedText/>
      </Provider>
    )).toMatchSnapshot()
  })
})