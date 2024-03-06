import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

/**
 * A user defined, customizable modal.
 * @param onSave A callback function when the save button is clicked.
 * @param onCancel A callback function when the cancel button is clicked.
 * @param modalState The current open/close state of the modal.
 * @param setModalState A handler to set the current open/close state of the modal.
 * @param modalContent The content field for the modal in HTML.
 * @returns A function component for a modal.
 */
export const Modal = ({
  onSave,
  onCancel,
  modalState,
  setModalState,
  modalContent,
}) => {
  return (
    <Transition.Root show={modalState} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => setModalState(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-grayprimary bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="border border-graysecondary relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-grayprimary px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start flex justify-center">
                    {modalContent}
                  </div>
                </div>
                <div className="bg-graysecondary px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-grayprimary sm:ml-3 sm:w-auto"
                    onClick={() => {
                      onSave();
                      setModalState(false);
                    }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-500 sm:mt-0 sm:w-auto"
                    onClick={() => {
                      onCancel();
                      setModalState(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

/**
 * An alert notification modal.
 * @param modalState The current open/close state of the modal.
 * @param setModalState A handler to set the current open/close state of the modal.
 * @param modalHeader A header field for the alert.
 * @param modalContent A content field for the alert.
 * @returns A function component for an alert modal.
 */
export const AlertModal = ({
  modalState,
  setModalState,
  modalHeader,
  modalContent,
}) => {
  return (
    <Transition.Root show={modalState} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => setModalState(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-grayprimary bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-graysecondary px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon
                        className="h-6 w-6 text-red-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-white"
                      >
                        {modalHeader}
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-white">{modalContent}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-grayprimary px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-grayprimary sm:ml-3 sm:w-auto"
                    onClick={() => {
                      setModalState(false);
                    }}
                  >
                    Ok
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

/**
 * A notification modal at the top of the screen.
 * @param modalState The current open/close state of the modal.
 * @param setModalState A handler to set the current open/close state of the modal.
 * @param modalHeader A header field for the alert.
 * @param modalContent A content field for the alert.
 * @returns A function component for a notification modal.
 */
export const NotificationModal = ({
  modalState,
  setModalState,
  modalHeader,
  modalContent,
}) => {
  return (
    <Transition.Root show={modalState} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => setModalState(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-grayprimary bg-opacity-20 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-graysecondary px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-white"
                      >
                        {modalHeader}
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-white">{modalContent}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-grayprimary px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-grayprimary sm:ml-3 sm:w-auto"
                    onClick={() => {
                      setModalState(false);
                    }}
                  >
                    Ok
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
