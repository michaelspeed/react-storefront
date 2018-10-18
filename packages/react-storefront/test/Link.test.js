/**
 * @license
 * Copyright © 2017-2018 Moov Corporation.  All rights reserved.
 */
jest.mock('../src/router/serviceWorker')

import React from 'react'
import { mount } from 'enzyme'
import Link from '../src/Link'
import { Provider } from 'mobx-react'
import { createMemoryHistory } from 'history'
import AppModelBase from '../src/model/AppModelBase'
import * as serviceWorker from '../src/router/serviceWorker'

describe('Link', () => {

  let app, history

  beforeEach(() => {
    history = createMemoryHistory()
    app = AppModelBase.create({
      location: {
        procotol: 'https',
        hostname: 'example.com',
        pathname: '/',
        search: ''
      }
    })
  })

  it('renders', () => {
    const component = (
      <Provider history={history} app={app}>
        <Link to="/p/1/" className="link" style={{ color: 'red' }}>Red Shirt</Link>
      </Provider>
    )

    expect(mount(component)).toMatchSnapshot()
  })

  it('should push the state prop onto window.history', () => {
    mount(
      <Provider history={history} app={app}>
        <Link to="/p/1/" state={{ page: 'product' }}>Red Shirt</Link>
      </Provider>
    )
      .find('a').at(0)
      .simulate('click')  

    expect(history.location.state).toEqual({ page: 'product' })
  })

  it('should force server-side navigation when server prop is set to true', () => {
    const history = {
      push: jest.fn()
    }

    mount(
      <Provider history={history} app={app}>
        <Link to="/p/1/" server>Red Shirt</Link>
      </Provider>
    )
      .find('a').at(0)
      .simulate('click') 

    expect(history.push.mock.calls.length).toEqual(0)
  })

  it('should not prefetch on mount when prefetch=null', () => {
    mount(
      <Provider history={history} app={app}>
        <Link to="/p/1" server>Red Shirt</Link>
      </Provider>
    )

    expect(serviceWorker.prefetchJsonFor.mock.calls.length).toEqual(0)
  })

  it('should prefetch on mount when prefetch=always', () => {
    mount(
      <Provider history={history} app={app}>
        <Link to="/p/1" server prefetch="always">Red Shirt</Link>
      </Provider>
    )

    expect(serviceWorker.prefetchJsonFor).toBeCalledWith('/p/1')
  })

  it('should prefetch the prefetchURL prop when present', () => {
    mount(
      <Provider history={history} app={app}>
        <Link to="/p/1" prefetchURL="/local/ca/p/1" server prefetch="always">Red Shirt</Link>
      </Provider>
    )

    expect(serviceWorker.prefetchJsonFor).toBeCalledWith('/local/ca/p/1')
  })

  it('should prefetch when visible when prefetch=visible', () => {
    mount(
      <Provider history={history} app={app}>
        <div style={{ display: 'none' }}>
          <Link to="/p/1" server prefetch="visible">Red Shirt</Link>
        </div>
      </Provider>
    )

    // react-visibility-sensor always reports that the component is visible in enzyme
    expect(serviceWorker.prefetchJsonFor).toBeCalledWith('/p/1')
  })

  it('should push relative path to history if url is absolute', () => {
    mount(
      <Provider history={history} app={app}>
        <Link to="https://domain.test/p/1" state={{ page: 'product' }}>Red Shirt</Link>
      </Provider>
    )
      .find('a').at(0)
      .simulate('click')

    expect(history.location.pathname).toEqual('/p/1')
  })

  it('should not call history.push if the link contains mailto:', () => {
    const history = { push: jest.fn() }

    mount(
      <Provider history={history} app={app}>
        <Link to="mailto:user@domain.com">Mail</Link>
      </Provider>
    )
      .find('a').at(0)
      .simulate('click')

    expect(history.push).not.toHaveBeenCalled()
  })

  it('should not call history.push if the link contains tel:', () => {
    const history = { push: jest.fn() }

    mount(
      <Provider history={history} app={app}>
        <Link to="tel:1111111111">Tel</Link>
      </Provider>
    )
      .find('a').at(0)
      .simulate('click')

    expect(history.push).not.toHaveBeenCalled()
  })

  it('should always render absolute URLs for SEO purposes', () => {
    const href = mount(
      <Provider history={history} app={app}>
        <Link to="/p/1">Red Shirt</Link>
      </Provider>
    ).find('a').getDOMNode().getAttribute('href')

    expect(href).toEqual('https://example.com/p/1')
  })

  it('should spread data props to the underlying a tag', () => {
    expect(
      mount(
        <Provider history={history} app={app}>
          <Link to="/p/1" data-foo="bar">Red Shirt</Link>
        </Provider>
      ).find('a[data-foo="bar"]').length
    ).toBe(1)
  })

  afterAll(() => {
    jest.unmock('../src/router/serviceWorker')
  })
})