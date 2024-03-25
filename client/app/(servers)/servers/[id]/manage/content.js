'use client';

import ServerIcon from '@/app/(servers)/servers/components/ServerIcon';
import config from '@/config';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IoMdCheckmarkCircle } from 'react-icons/io';
import { MdChevronLeft } from 'react-icons/md';
import { toast } from 'sonner';
import CategoriesDrawer from '@/app/(servers)/servers/components/Drawer/Categories';
import { TbLoader } from 'react-icons/tb';
import editServer from '@/lib/request/servers/editServer';
import { RiErrorWarningFill } from 'react-icons/ri';
import deleteServer from '@/lib/request/servers/deleteServer';
import { useRouter } from 'next-nprogress-bar';

export default function Content({ server }) {
  const [currentServer] = useState(server);
  const [newDescription, setNewDescription] = useState(server.description);
  const [newInviteLink, setNewInviteLink] = useState(server.invite_code.type === 'Deleted' ? 'Invite link was deleted.' : (server.invite_code.type === 'Vanity' ? server.vanity_url : `https://discord.com/invite/${server.invite_code.code}`));
  const [newCategory, setNewCategory] = useState(server.category);
  const [newKeywords, setNewKeywords] = useState(server.keywords);

  const [categoriesDrawerIsOpen, setCategoriesDrawerIsOpen] = useState(false);
  const [keywordsInputValue, setKeywordsInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [anyChangesMade, setAnyChangesMade] = useState(false);
  const [showDeleteConsent, setShowDeleteConsent] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    setAnyChangesMade(
      newDescription !== server.description ||
      newInviteLink !== (server.invite_code.type === 'Deleted' ? 'Invite link was deleted.' : (server.invite_code.type === 'Vanity' ? server.vanity_url : `https://discord.com/invite/${server.invite_code.code}`)) ||
      newCategory !== server.category ||
      newKeywords.join(' ') !== server.keywords.join(' ')
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newDescription, newInviteLink, newCategory, newKeywords]);

  async function save() {
    if (!anyChangesMade) return toast.error('No changes were made.');
    
    setLoading(true);

    toast.promise(editServer(currentServer.id, { newDescription, newInviteLink, newCategory, newKeywords }), {
      loading: 'Saving changes..',
      success: () => {
        setLoading(false);
        setAnyChangesMade(false);

        return 'Successfully saved changes!';
      },
      error: error => {
        setLoading(false);
        return error;
      }
    });
  }

  async function continueDeleteServer() {
    setLoading(true);

    toast.promise(deleteServer(currentServer.id), {
      loading: `Deleting ${currentServer.name}..`,
      success: () => {
        setTimeout(() => router.push('/'), 3000);
        
        return `Successfully deleted ${currentServer.name}. You will be redirected to the home page in a few seconds.`;
      },
      error: error => {
        setLoading(false);
        return error;
      }
    });
  }

  return (
    <div className='flex flex-col items-center justify-center h-full px-8 mt-48 mb-16 gap-y-4 lg:px-0'>
      <div className="flex justify-center w-full gap-y-4 max-w-[800px] flex-col">
        <div className='flex items-center gap-x-4'>
          <Link className="p-1.5 rounded-xl bg-secondary hover:bg-tertiary" href={`/servers/${currentServer.id}`}>
            <MdChevronLeft size={24} />
          </Link>
              
          <h1 className="flex items-center text-xl font-bold sm:text-3xl gap-x-1">
            Manage <ServerIcon width={32} height={32} icon_url={currentServer.icon_url} name={currentServer.name} /> {currentServer.name}
          </h1>
        </div>
              
        <p className='text-sm sm:text-base max-w-[800px] text-tertiary'>
          You{'\''}re currently managing {currentServer.name}. You can edit the about section, invite link, and more.
        </p>

        <div className='flex items-center justify-center w-full mt-12'>
          <div className='max-w-[800px] w-full flex flex-col gap-y-1'>
            <h2 className='text-lg font-semibold'>
              Description
            </h2>
                
            <p className='text-sm sm:text-basetext-tertiary'>
              This is the description that will be shown to everyone who visits your server on discord.place.<br/>Make sure to include important information about your server.
            </p>

            <span contentEditable suppressContentEditableWarning className='block w-full h-[150px] p-2 mt-4 overflow-y-auto border-2 border-transparent rounded-lg outline-none bg-secondary text-placeholder focus-visible:text-primary focus-visible:border-purple-500' onKeyUp={event => {
              if (event.target.textContent.length > config.serverDescriptionMaxCharacters) return toast.error(`Description can only contain ${config.serverDescriptionMaxCharacters} characters.`);
              setNewDescription(event.target.textContent);
            }}>
              {server.description}
            </span>
          </div>
        </div>

        <h2 className='mt-8 text-lg font-semibold'>
          Invite link
        </h2>

        <p className='text-sm sm:text-basetext-tertiary'>
          Add an invite link to your server. This will be helpful for people who want to join your server.<br/>Make sure to set the invite link to never expire.
        </p>

        <input
          className='block w-full p-2 mt-4 overflow-y-auto text-sm border-2 border-transparent rounded-lg outline-none placeholder-placeholder bg-secondary text-placeholder focus-visible:text-primary focus-visible:border-purple-500'
          placeholder='https://discord.gg/invite'
          autoComplete='off'
          spellCheck='false'
          value={newInviteLink}
          onChange={event => setNewInviteLink(event.target.value)}
        />

        <div className='flex flex-col mt-8 sm:flex-row gap-x-4'>
          <div className='flex flex-col gap-y-2'>
            <h2 className='text-lg font-semibold'>
              Category
            </h2>

            <p className='text-sm text-tertiary'>
              Select a base category for your server. This will help people find your server on discord.place.
            </p>

            <button className='flex items-center justify-center w-full h-[40px] mt-4 text-sm font-medium rounded-lg gap-x-2 bg-secondary hover:bg-tertiary text-primary' onClick={() => setCategoriesDrawerIsOpen(true)}>
              {newCategory}
              <IoMdCheckmarkCircle />
            </button>

            <CategoriesDrawer openState={categoriesDrawerIsOpen} setOpenState={setCategoriesDrawerIsOpen} state={newCategory} setState={setNewCategory} />
          </div>

          <div className='flex flex-col gap-y-2'>
            <h2 className='text-lg font-semibold'>
              Keywords
            </h2>

            <p className='text-sm text-tertiary'>
              Add keywords to your server. This will help people find your server on discord.place.
            </p>

            <div className='relative'>
              <input
                className='block w-full h-[40px] px-2 mt-4 overflow-y-auto text-sm border-2 border-transparent rounded-lg outline-none disabled:pointer-events-none disabled:opacity-70 placeholder-placeholder bg-secondary text-placeholder focus-visible:text-primary focus-visible:border-purple-500'
                autoComplete='off'
                spellCheck='false'
                value={keywordsInputValue}
                placeholder='Type a keyword and press enter or space..'
                onChange={event => {
                  const regexp = new RegExp(/[^a-zA-Z0-9-]/g);
                  if (regexp.test(event.target.value)) return;
                  if (event.target.value.length > config.serverKeywordsMaxCharacters) return toast.error(`Keyword can only contain ${config.serverKeywordsMaxCharacters} characters.`);

                  setKeywordsInputValue(event.target.value);
                }}
                onKeyUp={event => {
                  if (event.key === ' ' || event.key === 'Enter') {
                    if (keywordsInputValue.trim().length <= 0) return;

                    setNewKeywords(oldKeywords => [...oldKeywords, keywordsInputValue.trim()]);
                    setKeywordsInputValue('');
                  }
                }}
                disabled={newKeywords.length >= config.serverKeywordsMaxLength}
              />
            </div>
          </div>
        </div>

        {newKeywords.filter(keyword => keyword.length > 0).length > 0 && (
          <>
            <h3 className='mt-4 text-sm font-medium text-secondary'>
              {newKeywords.filter(keyword => keyword.length > 0).length} Keywords
            </h3>

            <div className='flex flex-wrap mt-2 gap-x-2 gap-y-1'>
              {newKeywords
                .filter(keyword => keyword.length > 0)
                .map((keyword, i) => (
                  <button key={i} className='flex items-center gap-x-1.5 px-3 py-1.5 rounded-lg font-semibold text-white bg-black hover:bg-black/70 dark:bg-white dark:text-black dark:hover:bg-white/70 text-sm' onClick={() => setNewKeywords(oldKeywords => oldKeywords.filter(k => k !== keyword))}>
                    {keyword}
                  </button>
                ))}
            </div>
          </>
        )}

        <h2 className='mt-8 text-lg font-semibold'>
          Are you ready?
        </h2>

        <p className='text-sm sm:text-basetext-tertiary'>
          Make sure to double-check everything before saving. Once you save, the changes will be live on discord.place.
        </p>
                
        <div className='flex flex-col w-full gap-2 mt-2 sm:flex-row'>
          <button 
            className='flex items-center gap-x-1.5 px-3 py-1.5 rounded-lg font-semibold text-white bg-black w-full justify-center hover:bg-black/70 dark:bg-white dark:text-black dark:hover:bg-white/70 text-sm disabled:pointer-events-none disabled:opacity-70' 
            disabled={
              !anyChangesMade ||
              loading ||
              newDescription.length < 1 ||
              newInviteLink.length < 1 ||
              !newCategory ||
              newKeywords.length < 1
            } 
            onClick={save}
          >
            {loading && <TbLoader className='animate-spin' />}
            Save
          </button>
          <button className='flex items-center justify-center w-full py-2 text-sm font-medium rounded-lg hover:bg-secondary disabled:pointer-events-none disabled:opacity-70'
            onClick={() => {
              setNewDescription(server.description);
              setNewInviteLink(server.invite_code.type === 'Deleted' ? 'Invite link was deleted.' : (server.invite_code.type === 'Vanity' ? server.vanity_url : `https://discord.com/invite/${server.invite_code.code}`));
              setNewCategory(server.category);
              setNewKeywords(server.keywords);
            }}
            disabled={!anyChangesMade || loading}
          >
            Cancel
          </button>
        </div>

        {server.permissions.canDelete && (
          <div className='flex flex-col p-4 mt-8 border border-red-500 gap-y-2 bg-red-500/10 rounded-xl'>
            <h1 className='text-lg text-primary flex items-center font-semibold gap-x-1.5'>
              <RiErrorWarningFill />
              Danger Zone
            </h1>
            <p className='text-sm font-medium text-tertiary'>
              {showDeleteConsent ? (
                <>
                  Are you sure you really want to delete this server?
                </>
              ) : (
                <>
                  You can delete the server using the button below, but be careful not to delete it by mistake :)
                </>
              )}
            </p>
            
            <div className='flex mt-1 gap-x-2'>
              {showDeleteConsent ? (
                <>
                  <button className='flex items-center gap-x-1.5 px-3 py-1 text-sm font-medium text-white bg-black rounded-lg w-max dark:bg-white dark:text-black dark:hover:bg-white/70 hover:bg-black/70 disabled:pointer-events-none disabled:opacity-70' onClick={continueDeleteServer} disabled={loading}>
                    {loading && (
                      <TbLoader className='animate-spin' />
                    )}
                    Confirm
                  </button>

                  <button className='px-3 py-1 text-sm font-medium text-white bg-black rounded-lg w-max dark:bg-white dark:text-black dark:hover:bg-white/70 hover:bg-black/70 disabled:pointer-events-none disabled:opacity-70' onClick={() => setShowDeleteConsent(false)} disabled={loading}>
                    Cancel
                  </button>
                </>
              ) : (
                <button className='px-3 py-1 text-sm font-medium text-white bg-black rounded-lg w-max dark:bg-white dark:text-black dark:hover:bg-white/70 hover:bg-black/70' onClick={() => setShowDeleteConsent(true)}>
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}