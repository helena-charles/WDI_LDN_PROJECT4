/* global describe, it */

import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

import NotFound from '../../src/components/common/NotFound';
import Image from '../../src/components/common/Image';

describe('NotFound tests', () => {

  it('should render a single h1 tag', done => {
    const wrapper = shallow(<NotFound />);
    expect(wrapper.find('h1').length).to.equal(1);
    done();
  });

  it('should render a h1 with the text "404: Not Found"', done => {
    const wrapper = shallow(<NotFound />);
    expect(wrapper.text()).to.equal('404: Not Found');
    done();
  });
});

// describe('Image tests', () => {
//
//   it('should render 1 label, 1 input field, and 2 span tags', done => {
//     const wrapper = shallow(<Image />);
//     expect(wrapper.find('label').length).to.equal(1);
//     expect(wrapper.find('input').length).to.equal(1);
//     expect(wrapper.find('span').length).to.equal(2);
//     done();
//   });
//
//   it('should render a span with the text "Choose a file..."', done => {
//     const wrapper = shallow(<Image />);
//     expect(wrapper.childAt(1).childAt(0).childAt(2).html()).to.equal('<span className="file-label">Choose a file…</span>');
//     expect(wrapper.childAt(1).childAt(0).childAt(2).childAt(0).text()).to.equal('Choose a file...');
//     done();
//   });
//
//   it('should render a div with the className dropzone', done => {
//     const wrapper = shallow(<Image />);
//     expect(wrapper.childAt(1).hasClass('dropzone'));
//     done();
//   });
// });

describe('FlashMessages tests', () => {

  it('should render ')
})
