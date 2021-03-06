/**
 * jQuery booklyEditable.
 */
(function ($) {
    let $modal = $('#bookly-editable-modal');
    let methods = {
        init: function (options) {
            let opts = $.extend({}, $.fn.booklyEditable.defaults, options);

            return this.each(function () {
                if ($(this).data('booklyEditable')) {
                    return;
                }
                let obj = {
                    $container: $(this),
                    opts: opts,
                    values: {},
                    option: '',
                    type: '',
                    title: function () {
                        let title = obj.$container.data('title');
                        return title === undefined ? '' : title;
                    }
                }
                $.each(methods.parseJson(obj.$container.data('values')), function (index, value) {
                    obj.values[index] = value;
                });
                obj.type = obj.$container.data('fieldtype') || 'input';
                obj.option = obj.$container.data('option');
                if (!obj.$container.data('ace')) {
                    // Init popover
                    obj.content = function () {
                        let $content = $('<div class="mt-2">');
                        switch (obj.type) {
                            case 'textarea':
                                $.each(obj.values, function (index, value) {
                                    $content.append('<div class="form-group mb-2"><textarea class="form-control bookly-js-editable-control" name="' + index + '" rows="5" cols="50">' + value + '</textarea></div>');
                                });
                                break;
                            default:
                                $.each(obj.values, function (index, value) {
                                    $content.append('<div class="form-group mb-2"><input type="text" class="form-control bookly-js-editable-control" name="' + index + '" value="' + value + '"/></div>');
                                });
                                break;
                        }
                        $content.append('<hr/>');
                        $content.append('<div class="text-right"><div class="btn-group btn-group-sm" role="group"><button type="button" class="btn btn-success bookly-js-editable-save"><i class="fas fa-fw fa-check"></i></button><button type="button" class="btn btn-default" data-dismiss="bookly-popover"><i class="fas fa-fw fa-times"></i></button></div></div>');
                        // Click on "Close" button.
                        $content.find('button[data-dismiss="bookly-popover"]').click(function () {
                            close();
                        });
                        // Click on "Save" button.
                        $content.find('button.bookly-js-editable-save').click(function () {
                            save();
                        });
                        // Process keypress.
                        $content.find('.bookly-js-editable-control').on('keyup', function (e) {
                            if (e.keyCode === 27) {
                                close();
                            }
                        });

                        function close() {
                            obj.$container.booklyPopover('hide');
                        }

                        function save() {
                            $content.find('.bookly-js-editable-control').each(function () {
                                obj.values[this.name] = this.value;
                            });
                            // Update values for all editable fields with same data-option
                            $('[data-option="' + obj.option + '"]').each(function () {
                                $(this).booklyEditable('setValue', obj.values);
                            });
                            obj.$container.booklyPopover('hide');
                        }

                        return $content;
                    };

                    obj.$container.booklyPopover({
                        html: true,
                        placement: obj.$container.data('placement') !== undefined ? obj.$container.data('placement') : opts.placement,
                        fallbackPlacement: obj.$container.data('fallbackPlacement') !== undefined ? obj.$container.data('fallbackPlacement') : opts.fallbackPlacement,
                        container: opts.container,
                        template: '<div class="bookly-popover bookly-editable-popover" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>',
                        trigger: 'manual',
                        title: obj.title,
                        content: obj.content
                    });
                }
                // Click on editable field.
                obj.$container.on('click', function (e) {
                    e.preventDefault();
                    if (obj.$container.data('ace')) {
                        // ACE Editor
                        $('.modal-title', $modal).text(obj.$container.data('title') ? obj.$container.data('title') : BooklyL10nEditable.title);
                        $('#bookly-ace-save', $modal).data('container', obj.$container).data('option', obj.option);

                        // Init editor and set value
                        let editor = $('#bookly-ace-editor').get(0).env.editor;
                        editor.session.setValue(obj.values[obj.option]);

                        // Init autocomplete
                        var staticWordCompleter = ace.require('ace/mode/bookly_completer').BooklyCompleter;
                        var langTools = ace.require('ace/ext/language_tools');
                        langTools.setCompleters([staticWordCompleter(editor, obj.$container.data('codes'))]);

                        $modal.booklyModal('show');
                    } else {
                        // Init bootstrap popover if ace editor is not required
                        if (!obj.$container.attr('aria-describedby')) {
                            $('.bookly-popover').each(function () {
                                $('[aria-describedby="' + $(this).attr('id') + '"]').booklyPopover('hide');
                            });

                            obj.$container.booklyPopover('show');
                            obj.$container.off('shown.bs.popover').on('shown.bs.popover', function () {
                                if (obj.$container.attr('aria-describedby') !== undefined) {
                                    $(obj.$container.data('bs.popover').tip).find('.bookly-js-editable-control:first').focus();
                                }
                            });
                        } else {
                            obj.$container.booklyPopover('hide');
                        }
                    }
                });

                // Set text for empty field.
                if (obj.$container.text() === '') {
                    obj.$container.text(opts.empty);
                }

                obj.$container.data('booklyEditable', obj);
            });
        },
        setValue: function (values) {
            var obj = this.data('booklyEditable');
            if (!obj) {
                return;
            }

            obj.values = values;

            // Update field text.
            obj.$container.text(obj.values[obj.option] === '' ? obj.opts.empty : obj.values[obj.option]);
        },
        getValue: function () {
            var obj = this.data('booklyEditable');
            if (!obj) {
                return;
            }

            return obj.values;
        },
        parseJson: function (s) {
            if (typeof s === 'string' && s.length && s.match(/^[\{\[].*[\}\]]$/)) {
                s = (new Function('return ' + s))();
            }
            return s;
        },
    };

    // Process click outside popover to hide it.
    $(document).on('click', function (e) {
        if (!$(e.target).hasClass('bookly-js-editable')) {
            let $activators = $('.bookly-js-editable[aria-describedby]');
            if ($activators.length > 0 && $(e.target).parents('.bookly-popover').length === 0) {
                $activators.booklyPopover('hide');
            }
        }
    });

    // Init ACE Editor
    if ($('#bookly-ace-editor').length) {
        var editor = ace.edit('bookly-ace-editor');
        editor.renderer.setShowGutter(false);
        editor.setShowPrintMargin(false);
        editor.setHighlightActiveLine(false);
        editor.setOptions({
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            wrap: true,
            indentedSoftWrap: false,
            fontSize: '14pt',
        });
        editor.getSession().setMode('ace/mode/bookly');

        $modal.on('hide.bs.modal', function () {
            var editor = $('#bookly-ace-editor').get(0).env.editor;
            editor.setValue('');
        });

        $modal.on('shown.bs.modal', function () {
            var editor = $('#bookly-ace-editor').get(0).env.editor;
            editor.focus();
            const session = editor.getSession();
            const count = session.getLength();
            editor.gotoLine(count, session.getLine(count - 1).length);

        });

        $('#bookly-ace-save', $modal).on('click', function () {
            let option = $(this).data('option'),
                values = {};
            values[option] = $('#bookly-ace-editor').get(0).env.editor.getValue();
            // Update values for all editable fields with same data-option
            $('[data-option="' + option + '"]').each(function () {
                $(this).booklyEditable('setValue', values);
            });
            $modal.booklyModal('hide');
        });
    }

    $.fn.booklyEditable = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('No method ' + method + ' for jQuery.booklyEditable');
        }
    };

    $.fn.booklyEditable.defaults = {
        placement: 'auto',
        fallbackPlacement: ['bottom'],
        container: '#bookly-appearance',
        empty: 'Empty',
    };
})(jQuery);